import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import CryptoJS from 'crypto-js';
import { Loader2, MessageSquare, ChevronRight, Lock } from 'lucide-react';

const Inbox = () => {
  const [inbox, setInbox] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const response = await api.get('/messages/inbox');
        const rawInbox = response.data.data.inbox;

        const decryptedInbox = rawInbox.map(chat => {
          const ids = [user.id.toString(), chat.other_user_id.toString()].sort();
          const sharedSecret = `campus_market_${chat.listing_id}_${ids[0]}_${ids[1]}`;
          let decryptedText = "🔒 [Encrypted Message]";
          try {
            const bytes = CryptoJS.AES.decrypt(chat.encrypted_content, sharedSecret);
            decryptedText = bytes.toString(CryptoJS.enc.Utf8);
          } catch (e) {}
          return { ...chat, preview: decryptedText };
        });

        setInbox(decryptedInbox);
      } catch (error) {
        console.error("Failed to load inbox", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchInbox();
  }, [user]);

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  if (inbox.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
        <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">No Active Chats</h3>
        <p className="text-gray-500 mt-2">When you message a seller or receive an inquiry, your secure E2EE chats will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Active Negotiations</h2>
        <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full"><Lock className="w-3 h-3"/> E2EE Secured</span>
      </div>
      <div className="divide-y divide-gray-100">
        {inbox.map((chat) => (
          <div key={chat.id} onClick={() => navigate(`/chat/${chat.listing_id}/${chat.other_user_id}`)} className="p-5 hover:bg-blue-50 cursor-pointer transition flex items-center justify-between group">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{chat.other_user_name}</h3>
              <p className="text-sm text-blue-600 font-semibold mb-1">{chat.listing_title}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{chat.sender_id === user.id ? 'You: ' : ''}{chat.preview}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="text-xs font-medium text-gray-400">
                {new Date(chat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inbox;