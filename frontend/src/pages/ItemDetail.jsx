import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { MapPin, Tag, Loader2, ArrowLeft, MessageSquare, Edit, ShieldAlert, Heart, X, UploadCloud, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await api.get(`/listings/${id}`);
        setItem(response.data.data.listing);
      } catch (error) {
        toast.error('Item not found or removed.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const addToWishlist = () => {
    const currentList = JSON.parse(localStorage.getItem('campus_market_wishlist') || '[]');
    if (currentList.some(w => w.id === item.id)) {
      toast('Already in wishlist!', { icon: 'ℹ️' });
      return;
    }
    const newItem = { id: item.id, title: item.title, price: item.price, image: item.images[0] };
    localStorage.setItem('campus_market_wishlist', JSON.stringify([...currentList, newItem]));
    toast.success('Added to wishlist! ❤️');
  };

  const openEditModal = () => {
    setEditForm({ ...item });
    setExistingImages([...item.images]);
    setNewFiles([]);
    setNewPreviews([]);
    setShowEditModal(true);
  };

  const removeExistingImage = (index) => setExistingImages(prev => prev.filter((_, i) => i !== index));
  const removeNewImage = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newFiles.length + files.length > 5) {
      return toast.error('Maximum 5 images allowed.');
    }
    setNewFiles(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newFiles.length === 0) return toast.error('Requires at least one image.');
    setIsSaving(true);
    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('price', editForm.price);
    formData.append('condition', editForm.condition);
    formData.append('description', editForm.description);
    formData.append('existingImages', JSON.stringify(existingImages));
    newFiles.forEach(file => formData.append('images', file));

    try {
      const response = await api.put(`/listings/${item.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setItem(response.data.data.listing);
      setShowEditModal(false);
      toast.success('Listing updated!');
      setActiveImage(0);
    } catch (error) {
      toast.error('Failed to update listing.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-50">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-bold tracking-wide">Loading Item Details...</p>
    </div>
  );

  if (!item) return null;
  const isOwner = user?.id === item.seller_id;
  const isSold = item.status === 'Sold';

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* EDIT MODAL */}
        <AnimatePresence>
          {showEditModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-gray-900">Edit Your Listing</h3>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={submitEdit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                    <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                      <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Condition</label>
                      <select value={editForm.condition} onChange={e => setEditForm({...editForm, condition: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50 appearance-none">
                        <option value="New">New</option><option value="Used - Like New">Used - Like New</option><option value="Used - Good">Used - Good</option><option value="Used - Fair">Used - Fair</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} required rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-gray-50/50"></textarea>
                  </div>
                  <div className="border-t border-gray-100 pt-6 mt-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Manage Photos (Max 5)</h4>
                    <div className="flex flex-wrap gap-4">
                      {existingImages.map((url, idx) => (
                        <div key={`exist-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                          <img src={url} alt="Existing" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      {newPreviews.map((url, idx) => (
                        <div key={`new-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-green-400 group">
                          <img src={url} alt="New" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                      {(existingImages.length + newFiles.length) < 5 && (
                        <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition">
                          <UploadCloud className="w-8 h-8 text-gray-400" />
                          <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-lg hover:shadow-xl mt-8">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            <div className="lg:w-1/2 p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/30">
              <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden mb-6 border border-gray-100 shadow-sm relative group">
                {item.images?.length > 0 ? (
                  <motion.img 
                    key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                    src={item.images[activeImage]} alt={item.title} 
                    className={`w-full h-full object-contain ${isSold ? 'grayscale opacity-80' : ''}`} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Image Available</div>
                )}
                {isSold && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                    <span className="bg-red-600 text-white font-black text-3xl px-8 py-3 rounded-2xl shadow-2xl transform -rotate-12 border-4 border-red-700">SOLD OUT</span>
                  </div>
                )}
              </div>
              
              {item.images?.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {item.images.map((img, index) => (
                    <button key={index} onClick={() => setActiveImage(index)} className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 ${activeImage === index ? 'border-blue-600 shadow-md transform scale-105' : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'}`}>
                      <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tight mb-2">{item.title}</h1>
                  {isOwner && <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block mb-2 shadow-sm border border-blue-200">Your Listing</span>}
                </div>
                {!isOwner && (
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={addToWishlist} className="p-3.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-colors shadow-sm border border-gray-100">
                    <Heart className="w-7 h-7" />
                  </motion.button>
                )}
              </div>
              
              <p className="text-5xl font-black text-blue-600 mb-8 tracking-tight">₹{item.price}</p>

              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center gap-2.5 bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-gray-700">{item.campus_name}</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-gray-700">{item.condition}</span>
                </div>
              </div>

              <div className="mb-10 flex-grow">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">Details</h3>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-lg">{item.description}</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mt-auto">
                <p className="text-sm text-gray-500 mb-6 font-medium">Listed by <span className="font-black text-gray-900 text-base ml-1">{isOwner ? 'You' : item.seller_name}</span></p>
                
                {isOwner ? (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openEditModal} disabled={isSold} className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50">
                    <Edit className="w-5 h-5" /> Edit Your Listing
                  </motion.button>
                ) : (
                  <div className="space-y-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(`/chat/${item.id}/${item.seller_id}`)} disabled={isSold} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:bg-gray-400">
                      <MessageSquare className="w-6 h-6" /> {isSold ? 'Item Sold' : 'Message Seller Securely'}
                    </motion.button>
                    <p className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 py-2 rounded-lg border border-emerald-100">
                      <ShieldAlert className="w-4 h-4" /> End-to-End Encrypted Handover
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ItemDetail;