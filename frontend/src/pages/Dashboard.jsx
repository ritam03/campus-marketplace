import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PackageSearch, Heart, MessageSquare, History, PlusCircle, Tag, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Feed from '../components/listings/Feed';
import Inbox from '../components/chat/Inbox';
import MyListings from '../components/dashboard/MyListings';
import Settings from '../components/dashboard/Settings';
import Wishlist from '../components/dashboard/Wishlist';
import HistoryList from '../components/dashboard/History'; 

const Dashboard = () => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('feed');

  const renderContent = () => {
    switch (activeTab) {
      case 'feed': return <Feed key="feed" />;
      case 'chats': return <Inbox key="chats" />;
      case 'my-listings': return <MyListings key="my-listings" />;
      case 'wishlist': return <Wishlist key="wishlist" />;
      case 'history': return <HistoryList key="history" />;
      case 'settings': return <Settings key="settings" />;
      default: return <Feed key="feed-default" />;
    }
  };

  const navItemClass = (tabName) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
    activeTab === tabName 
      ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]' 
      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
  }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 bg-slate-50 min-h-screen">
      
      <aside className="w-full md:w-72 flex-shrink-0 relative">
        <div className="sticky top-28">
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 opacity-90"></div>
            <div className="w-20 h-20 bg-white p-1 rounded-full relative z-10 mb-3 shadow-md">
              <div className="w-full h-full bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-3xl font-black">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 w-full truncate">{user?.name}</h2>
            <p className="text-sm font-medium text-gray-500 w-full truncate mb-4">{user?.email}</p>
            
            <Link to="/post-item" className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-bold transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <PlusCircle className="w-5 h-5" /> Sell an Item
            </Link>
          </motion.div>

          <motion.nav initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <p className="px-4 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 mt-2">Discover</p>
            <button onClick={() => setActiveTab('feed')} className={navItemClass('feed')}><PackageSearch className="w-5 h-5" /> Marketplace</button>
            
            <p className="px-4 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 mt-6">My Activity</p>
            <button onClick={() => setActiveTab('my-listings')} className={navItemClass('my-listings')}><Tag className="w-5 h-5" /> My Listings</button>
            <button onClick={() => setActiveTab('chats')} className={navItemClass('chats')}><MessageSquare className="w-5 h-5" /> Messages</button>
            <button onClick={() => setActiveTab('wishlist')} className={navItemClass('wishlist')}><Heart className="w-5 h-5" /> Wishlist</button>
            <button onClick={() => setActiveTab('history')} className={navItemClass('history')}><History className="w-5 h-5" /> Trade History</button>
            
            <p className="px-4 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 mt-6">Account</p>
            <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')}><SettingsIcon className="w-5 h-5" /> Settings</button>
          </motion.nav>

        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
};

export default Dashboard;