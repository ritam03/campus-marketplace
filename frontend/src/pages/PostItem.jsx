import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, X, Loader2, Info, Sparkles, Tag, MapPin, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PostItem = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', price: '', condition: 'Used - Good', campusName: '', description: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) return toast.error('Maximum 5 images allowed.');
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return toast.error('Select at least one image.');
    setIsLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    selectedFiles.forEach(file => data.append('images', file));

    try {
      const uploadToast = toast.loading('Securely uploading to marketplace...');
      await api.post('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Listing live!', { id: uploadToast });
      navigate('/'); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post listing.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden">
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full mix-blend-overlay filter blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3 relative z-10"><Sparkles className="w-8 h-8 text-yellow-300" /> Post New Listing</h1>
            <p className="text-blue-100 font-medium relative z-10 text-lg">Turn your unused campus items into cash instantly.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Item Title *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Tag className="w-5 h-5 text-gray-400" /></div>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="e.g. Engineering Mathematics Vol 1" className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-lg font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Price (₹) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-bold text-lg">₹</div>
                  <input type="number" name="price" required min="0" value={formData.price} onChange={handleInputChange} placeholder="500" className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-lg font-bold text-gray-900" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Campus Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MapPin className="w-5 h-5 text-gray-400" /></div>
                  <input type="text" name="campusName" required value={formData.campusName} onChange={handleInputChange} placeholder="e.g. VIT Vellore" className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-lg font-medium" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Condition *</label>
                <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-lg font-medium appearance-none">
                  <option value="New">Brand New</option><option value="Used - Like New">Used - Like New</option><option value="Used - Good">Used - Good</option><option value="Used - Fair">Used - Fair</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Description *</label>
                <textarea name="description" required rows="5" value={formData.description} onChange={handleInputChange} placeholder="Describe the item, any flaws, and pickup preferences..." className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-lg font-medium resize-none"></textarea>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900">Upload Photos</h3>
                <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{selectedFiles.length}/5</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {previewUrls.map((url, index) => (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 group shadow-sm">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg transform hover:scale-110"><X className="w-4 h-4" /></button>
                    {index === 0 && <div className="absolute bottom-0 left-0 w-full bg-blue-600 text-white text-[10px] font-black text-center py-1 uppercase tracking-widest">Cover</div>}
                  </motion.div>
                ))}
                
                {selectedFiles.length < 5 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors group">
                    <UploadCloud className="w-10 h-10 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-bold text-gray-500 group-hover:text-blue-600">Add Photo</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-4 px-4 rounded-2xl shadow-xl shadow-blue-600/20 text-lg font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 transition-all">
                {isLoading ? <><Loader2 className="animate-spin h-6 w-6 mr-3" /> Processing...</> : 'Publish to Marketplace'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PostItem;