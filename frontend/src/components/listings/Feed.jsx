import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingApi } from '../../services/listing.api';
import { useAppStore } from '../../store/useAppStore';
import { MapPin, Tag, Loader2, Image as ImageIcon, User, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Feed = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { user } = useAppStore(); 
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({
    search: '', condition: '', minPrice: '', maxPrice: ''
  });

  const fetchListings = async (pageNum = 1, append = false) => {
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      const params = {
        page: pageNum, limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.condition && { condition: filters.condition })
      };

      const { listings: fetchedListings, meta: fetchedMeta } = await listingApi.getAllListings(params);
      
      if (append) setListings(prev => [...prev, ...fetchedListings]);
      else setListings(fetchedListings);
      setMeta(fetchedMeta);
    } catch (error) {
      toast.error('Failed to load marketplace feed.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchListings(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleLoadMore = () => {
    if (meta && page < meta.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchListings(nextPage, true);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Campus Feed</h2>
          <p className="text-sm text-gray-500 mt-1">Discover items from your peers in real-time</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text" name="search" placeholder="Search textbooks, electronics..."
              value={filters.search} onChange={handleFilterChange}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-300 outline-none"
            />
          </div>

          <div className="relative">
            <select
              name="condition" value={filters.condition} onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-300 outline-none appearance-none"
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="Used - Like New">Used - Like New</option>
              <option value="Used - Good">Used - Good</option>
              <option value="Used - Fair">Used - Fair</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-72">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Curating items...</p>
        </div>
      ) : listings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-72 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200"
        >
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">No Items Found</h3>
          <p className="text-gray-500">Try adjusting your filters or be the first to post!</p>
        </motion.div>
      ) : (
        <>
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {listings.map((item, index) => {
                const isOwner = user?.id === item.seller_id;
                const isSold = item.status === 'Sold';
                const isReserved = item.status === 'Reserved';

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={item.id} 
                    onClick={() => navigate(`/item/${item.id}`)}
                    className={`group flex flex-col rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border bg-white ${
                      isOwner ? 'border-blue-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden border-b border-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.title} 
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isSold ? 'grayscale opacity-70' : ''}`} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-300" /></div>
                      )}
                      
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-black text-gray-900 shadow-sm">
                        ₹{item.price}
                      </div>

                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {isOwner && (
                          <div className="bg-blue-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
                            <User className="w-3 h-3" /> Yours
                          </div>
                        )}
                        {isSold && (
                          <div className="bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                            Sold Out
                          </div>
                        )}
                        {isReserved && !isSold && (
                          <div className="bg-amber-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                            Reserved
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1.5 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium">
                        <MapPin className="w-3.5 h-3.5" /> {item.campus_name}
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg ${isOwner ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}`}>
                          <Tag className="w-3 h-3" /> {item.condition}
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                          {isOwner ? 'You' : item.seller_name}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {meta && page < meta.totalPages && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 flex justify-center">
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-70 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoadingMore ? <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</> : 'Load More Items'}
              </button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Feed;