import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Send, Lock, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
  const { listingId, otherUserId } = useParams();
  const navigate = useNavigate();
  const { user, socket, decrementUnreadCount } = useAppStore();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [listing, setListing] = useState(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [isProcessingOTP, setIsProcessingOTP] = useState(false);

  const messagesEndRef = useRef(null);

  if (!user) return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;

  const generateSharedSecret = () => {
    const ids = [user.id.toString(), otherUserId.toString()].sort();
    return `campus_market_${listingId}_${ids[0]}_${ids[1]}`;
  };
  const SHARED_SECRET = generateSharedSecret();

  const encryptMessage = (text) => CryptoJS.AES.encrypt(text, SHARED_SECRET).toString();
  const decryptMessage = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SHARED_SECRET);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch { return "🔒 [Corrupted Message]"; }
  };

  useEffect(() => {
    if (!socket || !user) return;

    const initializeChat = async () => {
      try {
        const listingRes = await api.get(`/listings/${listingId}`);
        setListing(listingRes.data.data.listing);

        await api.put('/messages/read', { otherUserId, listingId });
        decrementUnreadCount();

        const historyRes = await api.get(`/messages/${listingId}/${otherUserId}`);
        const decryptedHistory = historyRes.data.data.messages.map((msg) => ({
          ...msg, content: decryptMessage(msg.encrypted_content)
        }));
        setMessages(decryptedHistory);
      } catch (error) {
        toast.error('Failed to load chat.');
        navigate('/');
      } finally { setIsLoading(false); }
    };

    initializeChat();

    const roomId = `chat_${listingId}_${[user.id, otherUserId].sort().join('_')}`;
    socket.emit('join_chat', roomId);

    const handleReceiveMessage = (data) => {
      const decryptedText = decryptMessage(data.encryptedContent);
      setMessages((prev) => [...prev, { sender_id: data.senderId, content: decryptedText, created_at: new Date().toISOString() }]);
      api.put('/messages/read', { otherUserId, listingId }).catch(() => {});
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('metrics_updated', () => {
       api.get(`/listings/${listingId}`).then(res => setListing(res.data.data.listing));
    });

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('metrics_updated');
    };
  }, [listingId, otherUserId, socket, user, decrementUnreadCount, navigate]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || listing?.status === 'Sold') return;

    const rawText = newMessage;
    setNewMessage(''); 

    const encryptedContent = encryptMessage(rawText);
    setMessages((prev) => [...prev, { sender_id: user.id, content: rawText, created_at: new Date().toISOString() }]);

    const roomId = `chat_${listingId}_${[user.id, otherUserId].sort().join('_')}`;
    socket.emit('send_message', { roomId, senderId: user.id, receiverId: otherUserId, listingId, encryptedContent });
    api.post('/messages', { listingId, receiverId: otherUserId, encryptedContent }).catch(() => toast.error('Failed to save.'));
  };

  const handleInitiateHandover = async () => {
    try {
      setIsProcessingOTP(true);
      const res = await api.post('/transactions/reserve', { listingId, buyerId: otherUserId });
      setTransaction(res.data.data.transaction);
      setListing({ ...listing, status: 'Reserved' }); // Update local status
      toast.success('Item Reserved! OTP sent securely to buyer email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reserve item.');
    } finally { setIsProcessingOTP(false); }
  };

  const handleVerifyHandover = async () => {
    if (otpInput.length !== 6) return toast.error('OTP must be 6 digits.');
    try {
      setIsProcessingOTP(true);
      // We pass listingId now, backend handles the rest!
      await api.post('/transactions/verify', { listingId: listing.id, otp: otpInput });
      toast.success('Handover Verified! Item marked as SOLD.');
      setListing({ ...listing, status: 'Sold' });
      setShowHandoverModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP.');
    } finally { setIsProcessingOTP(false); }
  };

  if (isLoading || !listing) return <div className="flex justify-center mt-20"><Loader2 className="w-10 h-10 text-blue-600 animate-spin" /></div>;

  const isSeller = user.id === listing.seller_id;
  const isReserved = listing.status === 'Reserved';
  const isAvailable = listing.status === 'Available';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[85vh] flex flex-col relative">
      
      {/* Handover Modal Overlay */}
      {showHandoverModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm rounded-2xl p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex justify-center mb-4"><ShieldCheck className="w-16 h-16 text-blue-600" /></div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Secure Handover</h2>
            
            {/* If not reserved yet, show Initiate UI. If reserved, jump straight to Verify UI */}
            {!isReserved && !transaction ? (
              <>
                <p className="text-center text-gray-600 mb-6">You are about to reserve <b>{listing.title}</b>. This locks the item.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowHandoverModal(false)} className="flex-1 bg-gray-100 font-bold py-3 rounded-xl hover:bg-gray-200">Cancel</button>
                  <button onClick={handleInitiateHandover} disabled={isProcessingOTP} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 flex justify-center">
                    {isProcessingOTP ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Send OTP'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center mb-6">
                  <p className="text-sm text-green-800 font-medium">An email with the 6-digit OTP has been sent securely to the buyer.</p>
                </div>
                <p className="text-center text-sm text-gray-600 mb-4">When you meet the buyer, ask them for their code to verify the handover.</p>
                
                <input 
                  type="text" maxLength="6" placeholder="Enter 6-digit OTP" 
                  value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl tracking-widest font-bold px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 mb-6"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowHandoverModal(false)} className="flex-1 bg-gray-100 font-bold py-3 rounded-xl hover:bg-gray-200">Close</button>
                  <button onClick={handleVerifyHandover} disabled={isProcessingOTP || otpInput.length !== 6} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 flex justify-center disabled:opacity-50">
                    {isProcessingOTP ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Mark Sold'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-6 py-4 rounded-t-2xl shadow-sm border border-gray-100 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-blue-600"><ArrowLeft className="w-6 h-6" /></button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{listing.title}</h2>
            <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
              <span className="text-green-600 flex gap-1"><Lock className="w-3 h-3" /> E2EE</span>
              | ₹{listing.price} | Status: <span className={listing.status === 'Sold' ? 'text-red-500' : 'text-blue-600'}>{listing.status}</span>
            </p>
          </div>
        </div>
        
        {/* Persistent Button for Available OR Reserved items */}
        {isSeller && (isAvailable || isReserved) && (
          <button onClick={() => setShowHandoverModal(true)} className={`text-white text-sm font-bold px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-2 ${isReserved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            <ShieldCheck className="w-4 h-4" /> {isReserved ? 'Verify Handover' : 'Secure Handover'}
          </button>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 border-x border-gray-100 flex flex-col gap-4">
        {listing.status === 'Sold' && (
          <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-center flex items-center justify-center gap-2 shadow-sm mb-4">
            <CheckCircle className="w-5 h-5" /> This item has been successfully sold via OTP Handover!
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.sender_id === user.id;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                <p className="text-sm md:text-base break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 rounded-b-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={listing.status === 'Sold'}
            placeholder={listing.status === 'Sold' ? "Item is sold. Chat is closed." : "Type a secure message..."}
            className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 disabled:opacity-50"
          />
          <button type="submit" disabled={!newMessage.trim() || listing.status === 'Sold'} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl disabled:opacity-50 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;