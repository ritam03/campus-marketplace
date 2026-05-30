import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { listingApi } from '../../services/listing.api';
import { useAppStore } from '../../store/useAppStore';
import { Loader2, Tag, Edit, Trash2, X, UploadCloud, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const MyListings = () => {
  const [myItems, setMyItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppStore();

  // Edit Modal States
  const [editingItem, setEditingItem] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const { listings } = await listingApi.getAllListings({ sellerId: user.id, limit: 100 });
        setMyItems(listings);
      } catch (error) {
        toast.error('Failed to load your listings.');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchMyListings();
  }, [user]);

  // --- DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item? This cannot be undone.')) return;
    try {
      await api.delete(`/listings/${id}`);
      setMyItems(prev => prev.filter(item => item.id !== id));
      toast.success('Listing deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete listing.');
    }
  };

  // --- EDIT MODAL LOGIC ---
  const openEditModal = (item) => {
    setEditingItem({ ...item });
    setExistingImages([...(item.images || [])]);
    setNewFiles([]);
    setNewPreviews([]);
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (existingImages.length === 0 && newFiles.length === 0) {
      return toast.error('Please have at least one image.');
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('title', editingItem.title);
    formData.append('price', editingItem.price);
    formData.append('condition', editingItem.condition);
    formData.append('description', editingItem.description);
    
    // Send URLs of the images we want to keep
    formData.append('existingImages', JSON.stringify(existingImages));
    
    // Append the physical new files
    newFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await api.put(`/listings/${editingItem.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update local state so UI updates instantly
      const updatedItem = response.data.data.listing;
      setMyItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
      
      setEditingItem(null);
      toast.success('Listing updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update listing.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Active Listings</h2>
      
      {myItems.length === 0 ? (
        <div className="text-center py-10">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">You haven't posted any items yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myItems.map(item => (
            <div key={item.id} className="border border-gray-100 rounded-lg p-4 flex gap-4 hover:shadow-md transition bg-white relative">
              
              {item.status === 'Sold' && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">SOLD</div>
              )}

              <img src={item.images?.[0] || 'https://via.placeholder.com/150'} alt={item.title} className="w-24 h-24 object-cover rounded-md border border-gray-200" />
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-1" title={item.title}>{item.title}</h3>
                <p className="text-blue-600 font-bold mb-auto">₹{item.price}</p>
                
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => openEditModal(item)}
                    disabled={item.status === 'Sold'}
                    className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-md text-sm font-medium transition disabled:opacity-50"
                  >
                    <Edit className="w-4 h-4"/> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-md text-sm font-medium transition"
                  >
                    <Trash2 className="w-4 h-4"/> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL OVERLAY */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Your Listing</h3>
              <button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={editingItem.title} onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select value={editingItem.condition} onChange={(e) => setEditingItem({...editingItem, condition: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="New">New</option>
                    <option value="Used - Like New">Used - Like New</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Used - Fair">Used - Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editingItem.description} onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} required rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              {/* Image Manager */}
              <div className="border-t border-gray-100 pt-5 mt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Manage Photos (Max 5)</h4>
                <div className="flex flex-wrap gap-3">
                  
                  {existingImages.map((url, idx) => (
                    <div key={`exist-${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={url} alt="Existing" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {newPreviews.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-green-400 group">
                      <img src={url} alt="New" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

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
    </div>
  );
};

export default MyListings;