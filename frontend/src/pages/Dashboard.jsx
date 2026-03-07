import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { PackageSearch, Heart, MessageSquare, History, PlusCircle, Tag, Bell, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      case 'feed': return <Feed />;
      case 'chats': return <Inbox />;
      case 'my-listings': return <MyListings />;
      case 'wishlist': return <Wishlist />;
      case 'history': return <HistoryList />;
      case 'settings': return <Settings />;
      default: return <Feed />;
    }
  };

  const navItemClass = (tabName) => `w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === tabName ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2 className="text-lg font-bold text-gray-900 w-full truncate">{user?.name}</h2>
          <p className="text-sm text-gray-500 w-full truncate">{user?.email}</p>
        </div>
        <div className="sticky top-24">
          <Link to="/post-item" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold transition shadow-md">
            <PlusCircle className="w-5 h-5" /> Sell an Item
          </Link>
        </div>

        <nav className="space-y-1 mb-8">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Discover</p>
          <button onClick={() => setActiveTab('feed')} className={navItemClass('feed')}><PackageSearch className="w-5 h-5" /> Browse Items</button>
          
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">My Activity</p>
          <button onClick={() => setActiveTab('my-listings')} className={navItemClass('my-listings')}><Tag className="w-5 h-5" /> My Listings</button>
          <button onClick={() => setActiveTab('chats')} className={navItemClass('chats')}><MessageSquare className="w-5 h-5" /> Messages</button>
          <button onClick={() => setActiveTab('wishlist')} className={navItemClass('wishlist')}><Heart className="w-5 h-5" /> Wishlist</button>
          <button onClick={() => setActiveTab('history')} className={navItemClass('history')}><History className="w-5 h-5" /> Trade History</button>
          
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Account</p>
          <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')}><SettingsIcon className="w-5 h-5" /> Settings</button>
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        {renderContent()}
      </main>

    </div>
  );
};

export default Dashboard;