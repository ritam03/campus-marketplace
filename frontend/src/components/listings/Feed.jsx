import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingApi } from '../../services/listing.api';
import { useAppStore } from '../../store/useAppStore';
import { MapPin, Tag, Loader2, Image as ImageIcon, User, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Feed = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { user } = useAppStore(); 
  const navigate = useNavigate();

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    condition: '',
    minPrice: '',
    maxPrice: ''
  });

  const fetchListings = async (pageNum = 1, append = false) => {
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      const params = {
        page: pageNum,
        limit: 12,
        ...(filters.search && { search: filters.search }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice })
      };

      const { listings: fetchedListings, meta: fetchedMeta } = await listingApi.getAllListings(params);
      
      if (append) {
        setListings(prev => [...prev, ...fetchedListings]);
      } else {
        setListings(fetchedListings);
      }
      setMeta(fetchedMeta);
    } catch (error) {
      toast.error('Failed to load marketplace feed.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch when page mounts or filters change (resetting to page 1)
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      
      {/* Header & Search/Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campus Feed</h2>
          <p className="text-sm text-gray-500 mt-1">Discover items from your peers</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-grow md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search items..."
              value={filters.search}
              onChange={handleFilterChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
            />
          </div>

          {/* Condition Filter */}
          <div className="relative">
            <select
              name="condition"
              value={filters.condition}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all appearance-none"
            >
              <option value="">All Conditions</option>
              <option value="New">New</option>
              <option value="Used - Like New">Used - Like New</option>
              <option value="Used - Good">Used - Good</option>
              <option value="Used - Fair">Used - Fair</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading campus items...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Items Found</h3>
          <p className="text-gray-500">Try adjusting your filters or be the first to post!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => {
              const isOwner = user?.id === item.seller_id;

              return (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/item/${item.id}`)}
                  className={`group flex flex-col rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer border ${
                    isOwner ? 'border-blue-200 bg-blue-50/20' : 'border-gray-100 bg-white'
                  }`}
                >
                  {/* Image Container */}
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden border-b border-gray-100">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-300" /></div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-sm font-bold text-gray-900 shadow-sm">
                      ₹{item.price}
                    </div>
                    {isOwner && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1">
                        <User className="w-3 h-3" /> Yours
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">{item.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                      <MapPin className="w-3.5 h-3.5" /> {item.campus_name}
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${isOwner ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        <Tag className="w-3 h-3" /> {item.condition}
                      </div>
                      <span className="text-xs font-medium text-gray-400">
                        {isOwner ? 'You' : item.seller_name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {meta && page < meta.totalPages && (
            <div className="mt-10 flex justify-center">
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                ) : (
                  'Load More Items'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;