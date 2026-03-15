import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ShieldCheck, Activity, Lock, Users, ArrowRight } from 'lucide-react';

const Landing = () => {
  // State to hold the live database counts
  const [stats, setStats] = useState({ users: 0, trades: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/transactions/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error("Failed to load live stats", error);
        // Fallbacks if the server is unreachable
        setStats({ users: 0, trades: 0 });
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Your Campus, Your Marketplace.
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            The safest way to buy, sell, and trade textbooks, electronics, and hostel essentials exclusively within your university.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-white text-blue-600 font-bold px-8 py-4 rounded-md hover:bg-blue-50 transition shadow-xl text-lg flex items-center gap-2">
              Join the Community <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="bg-blue-700 text-white border border-blue-500 font-bold px-8 py-4 rounded-md hover:bg-blue-800 transition shadow-lg text-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Live Platform Statistics */}
      <section className="py-16 -mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center bg-white shadow-2xl rounded-2xl p-10 border border-gray-100">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-5xl font-extrabold text-gray-900 mb-2">{stats.users}</h3>
              <p className="text-lg text-gray-600 font-medium">Registered Users</p>
            </div>
            <div className="p-6 border-t md:border-t-0 md:border-l border-gray-100">
              <div className="flex justify-center mb-4">
                <Activity className="w-12 h-12 text-green-500 animate-pulse" />
              </div>
              <h3 className="text-5xl font-extrabold text-gray-900 mb-2">{stats.trades}</h3>
              <p className="text-lg text-gray-600 font-medium">Successful Trades</p>
            </div>
          </div>
        </div>
      </section>

      {/* Production-Level Features Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Engineered for Security & Speed</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:shadow-lg transition">
              <Lock className="w-12 h-12 text-purple-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">E2EE Real-Time Chat</h3>
              <p className="text-gray-600">Negotiate privately. Your messages are end-to-end encrypted via WebSockets and cannot be read by anyone else.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:shadow-lg transition">
              <ShieldCheck className="w-12 h-12 text-green-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">OTP Handover Engine</h3>
              <p className="text-gray-600">Cryptographic 6-digit verification ensures items are only marked as "Sold" when the physical handover is successful.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 hover:shadow-lg transition">
              <Activity className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Platform Synchronization</h3>
              <p className="text-gray-600">Watch the marketplace update instantly. New items and metrics are broadcasted to all users with zero latency.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;