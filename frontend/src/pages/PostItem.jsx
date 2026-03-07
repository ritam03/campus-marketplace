import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, X, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const PostItem = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    condition: 'Used - Good',
    campusName: '',
    description: ''
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > 5) {
      toast.error('You can only upload up to 5 images.');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);
    
    // Generate local preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      // Free memory to prevent leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image.');
      return;
    }

    setIsLoading(true);

    // Must use FormData for file uploads, not standard JSON
    const data = new FormData();
    data.append('title', formData.title);
    data.append('price', formData.price);
    data.append('condition', formData.condition);
    data.append('campusName', formData.campusName);
    data.append('description', formData.description);
    
    selectedFiles.forEach((file) => {
      data.append('images', file); // 'images' matches the Multer config in our backend
    });

    try {
      // 1. Trigger the loading toast
      const uploadToast = toast.loading('Processing and uploading your item...');
      
      // 2. Fire the API request
      await api.post('/listings', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // 3. Update the exact same toast to a success state
      toast.success('Listing posted successfully to the marketplace!', { id: uploadToast });
      
      // 4. Redirect the user back to their dashboard feed
      navigate('/'); 
    } catch (err) {
      // Handle any backend or network errors
      toast.error(err.response?.data?.message || 'Failed to post listing. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell an Item</h1>
        <p className="text-gray-500 mb-8">Post your item to your campus marketplace. Make sure to provide clear details and good photos.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Title *</label>
              <input 
                type="text" 
                name="title" 
                required 
                value={formData.title} 
                onChange={handleInputChange} 
                placeholder="e.g. Engineering Mathematics Vol 1" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input 
                type="number" 
                name="price" 
                required 
                min="0" 
                value={formData.price} 
                onChange={handleInputChange} 
                placeholder="e.g. 500" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campus Name *</label>
              <input 
                type="text" 
                name="campusName" 
                required 
                value={formData.campusName} 
                onChange={handleInputChange} 
                placeholder="e.g. VIT Vellore" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
              <select 
                name="condition" 
                value={formData.condition} 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
              >
                <option value="New">New</option>
                <option value="Used - Like New">Used - Like New</option>
                <option value="Used - Good">Used - Good</option>
                <option value="Used - Fair">Used - Fair</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea 
                name="description" 
                required 
                rows="4" 
                value={formData.description} 
                onChange={handleInputChange} 
                placeholder="Describe the item, any flaws, and pickup preferences..." 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              ></textarea>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Photos</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)} 
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {selectedFiles.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition">
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-500">Add Photo</span>
                  <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                </label>
              )}
            </div>
            <p className="flex items-center gap-1 text-sm text-gray-500 mt-2">
              <Info className="w-4 h-4" /> Upload up to 5 images. First image will be the cover.
            </p>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin h-6 w-6 mr-2" /> Processing & Uploading...</>
              ) : (
                'Post Listing to Marketplace'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostItem;