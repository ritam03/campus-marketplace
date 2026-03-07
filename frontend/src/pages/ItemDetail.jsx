import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { MapPin, Tag, Loader2, ArrowLeft, MessageSquare, Edit, ShieldAlert, Heart, X, UploadCloud, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Edit Modal States
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

  // --- EDIT MODAL LOGIC ---
  const openEditModal = () => {
    setEditForm({ ...item });
    setExistingImages([...item.images]);
    setNewFiles([]);
    setNewPreviews([]);
    setShowEditModal(true);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newFiles.length + files.length;
    
    if (totalImages > 5) {
      return toast.error('You can only have up to 5 images total.');
    }

    setNewFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewPreviews(prev => [...prev, ...previews]);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newFiles.length === 0) {
      return toast.error('Please have at least one image.');
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('price', editForm.price);
    formData.append('condition', editForm.condition);
    formData.append('description', editForm.description);
    
    // Send the URLs of the images we want to keep
    formData.append('existingImages', JSON.stringify(existingImages));
    
    // Send the physical new files
    newFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await api.put(`/listings/${item.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setItem(response.data.data.listing);
      setShowEditModal(false);
      toast.success('Listing updated successfully!');
      setActiveImage(0); // reset view to first image
    } catch (error) {
      toast.error('Failed to update listing.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading item details...</p>
      </div>
    );
  }

  if (!item) return null;

  const isOwner = user?.id === item.seller_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      
      {/* EDIT MODAL OVERLAY */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Your Listing</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={submitEdit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select value={editForm.condition} onChange={(e) => setEditForm({...editForm, condition: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="New">New</option>
                    <option value="Used - Like New">Used - Like New</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Used - Fair">Used - Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} required rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              {/* Image Manager */}
              <div className="border-t border-gray-100 pt-5 mt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Manage Photos (Max 5)</h4>
                <div className="flex flex-wrap gap-3">
                  {/* Render Existing Kept Images */}
                  {existingImages.map((url, idx) => (
                    <div key={`exist-${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={url} alt="Existing" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Render Newly Added Previews */}
                  {newPreviews.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-green-400 group">
                      <img src={url} alt="New" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  {(existingImages.length + newFiles.length) < 5 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition">
                      <UploadCloud className="w-6 h-6 text-gray-400" />
                      <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              
              <button type="submit" disabled={isSaving} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition mt-6 shadow-md">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save All Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-6 transition">
        <ArrowLeft className="w-5 h-5" /> Back to Feed
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          
          <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4 border border-gray-200">
              {item.images && item.images.length > 0 ? (
                <img src={item.images[activeImage]} alt={item.title} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
              )}
            </div>
            
            {item.images && item.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.images.map((img, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${activeImage === index ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="mb-2 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{item.title}</h1>
                {isOwner && <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mt-2 inline-block">Your Item</span>}
              </div>
              {!isOwner && (
                <button onClick={addToWishlist} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition shadow-sm border border-gray-100">
                  <Heart className="w-6 h-6" />
                </button>
              )}
            </div>
            
            <p className="text-4xl font-black text-blue-600 mb-6">₹{item.price}</p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-800">{item.campus_name}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <Tag className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-800">{item.condition}</span>
              </div>
            </div>

            <div className="mb-8 flex-grow">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{item.description}</p>
            </div>

            <div className="border-t border-gray-100 pt-6 mt-auto">
              <p className="text-sm text-gray-500 mb-4">Posted by <span className="font-bold text-gray-900">{isOwner ? 'You' : item.seller_name}</span></p>
              
              {isOwner ? (
                <button 
                  onClick={openEditModal} 
                  disabled={item.status === 'Sold'}
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  <Edit className="w-5 h-5" /> Edit Your Listing
                </button>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate(`/chat/${item.id}/${item.seller_id}`)}
                    className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-md hover:shadow-lg"
                  >
                    <MessageSquare className="w-5 h-5" /> Message Seller Safely
                  </button>
                  <p className="flex items-center justify-center gap-1 text-xs text-green-600 font-medium">
                    <ShieldAlert className="w-4 h-4" /> End-to-End Encrypted via Campus Market
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;