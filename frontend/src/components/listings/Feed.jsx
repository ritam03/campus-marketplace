import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { MapPin, Tag, Loader2, Image as ImageIcon, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Feed = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppStore(); // Get logged-in user to check ownership
  const navigate = useNavigate();

useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get('/listings');
        
        // ONLY show items that are strictly 'Available' in the public feed
        const availableItems = response.data.data.listings.filter(
          (item) => item.status === 'Available'
        );
        
        setListings(availableItems); // Set the filtered items here!
        
      } catch (error) {
        toast.error('Failed to load marketplace feed.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading campus items...</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
        <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Items Found</h3>
        <p className="text-gray-500">Be the first to post an item to the marketplace!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Campus Feed</h2>
        <span className="bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
          {listings.length} Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => {
          const isOwner = user?.id === item.seller_id;

          return (
            <div 
              key={item.id} 
              onClick={() => navigate(`/item/${item.id}`)}
              className={`group rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col border ${
                isOwner ? 'border-blue-300 bg-blue-50/30' : 'border-gray-100 bg-white'
              }`}
            >
              {/* Image Container */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden border-b border-gray-100">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-300" /></div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-bold text-gray-900 shadow-sm">
                  ₹{item.price}
                </div>
                {/* Your Listing Badge */}
                {isOwner && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
                    <User className="w-3 h-3" /> Yours
                  </div>
                )}
              </div>

              {/* Content Details */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">{item.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" /> {item.campus_name}
                </div>
                
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${isOwner ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                    <Tag className="w-3 h-3" /> {item.condition}
                  </div>
                  <span className="text-xs text-gray-400">By {isOwner ? 'You' : item.seller_name}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Feed;