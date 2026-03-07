import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  // Load from local storage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('campus_market_wishlist') || '[]');
    setWishlist(saved);
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(item => item.id !== id);
    setWishlist(updated);
    localStorage.setItem('campus_market_wishlist', JSON.stringify(updated));
    toast.success('Removed from wishlist');
  };

  if (wishlist.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
        <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Your Wishlist is Empty</h3>
        <p className="text-gray-500 mt-2">Browse the feed and save items you want to keep an eye on.</p>
        <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 font-bold hover:underline">Go Browse Items</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wishlist.map(item => (
          <div key={item.id} className="border border-gray-100 rounded-lg p-4 flex gap-4 hover:shadow-md transition">
            <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-md" />
            <div className="flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
              <p className="text-blue-600 font-bold mb-auto">₹{item.price}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => navigate(`/item/${item.id}`)} className="flex-1 flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 rounded-md text-sm font-medium transition"><ArrowRight className="w-4 h-4"/> View</button>
                <button onClick={() => removeFromWishlist(item.id)} className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-md text-sm font-medium transition"><Trash2 className="w-4 h-4"/> Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;