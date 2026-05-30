import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionApi } from '../services/transaction.api';
import { ShieldCheck, Activity, Lock, Users, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const [stats, setStats] = useState({ users: 0, trades: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await transactionApi.getStats();
        setStats(data);
      } catch (error) {
        setStats({ users: 0, trades: 0 });
      }
    };
    fetchStats();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden">
      
      {/* Hero Section with Glassmorphism */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-blue-600">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white mb-8">
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-medium tracking-wide text-blue-50">The Next-Gen Campus Network</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-sm">
              Your Campus. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Your Marketplace.</span>
            </h1>
            
            <p className="text-xl text-blue-50/90 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              The safest way to buy, sell, and trade textbooks, electronics, and hostel essentials exclusively within your university.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="group bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] text-lg flex items-center justify-center gap-2 transform hover:-translate-y-1">
                Join the Community <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all shadow-lg text-lg flex items-center justify-center transform hover:-translate-y-1">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Statistics */}
      <section className="relative z-20 -mt-16 max-w-5xl mx-auto px-4 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 md:p-12 border border-white/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="text-center px-4">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-4 transform -rotate-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">{stats.users}+</h3>
              <p className="text-gray-500 font-semibold tracking-wide uppercase text-sm">Verified Students</p>
            </div>
            <div className="text-center px-4 pt-8 md:pt-0">
              <div className="w-16 h-16 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                <Activity className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">{stats.trades}</h3>
              <p className="text-gray-500 font-semibold tracking-wide uppercase text-sm">Successful Handovers</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Engineered for Security</h2>
            <p className="text-lg text-gray-500 mb-16 max-w-2xl mx-auto">We built Campus Marketplace with zero-trust architecture to ensure every transaction is completely safe.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -10 }} className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50 group text-left">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">E2EE Chat</h3>
              <p className="text-gray-500 leading-relaxed">Negotiate privately. Messages are encrypted via WebSockets and cannot be read by anyone else.</p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50 group text-left">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">OTP Handover</h3>
              <p className="text-gray-500 leading-relaxed">Cryptographic 6-digit verification ensures items are only marked as "Sold" when physically handed over.</p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50 group text-left">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Sync</h3>
              <p className="text-gray-500 leading-relaxed">Watch the marketplace update instantly. New items and metrics are broadcasted with zero latency.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;