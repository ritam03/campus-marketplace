import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth.api';
import { useAppStore } from '../store/useAppStore';
import { Store, Loader2, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAppStore();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user, token } = await authApi.login(formData);
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Store className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Please enter your details to sign in</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </motion.div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email" name="email" required value={formData.email} onChange={handleChange}
                className="block w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                placeholder="you@university.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password" name="password" required value={formData.password} onChange={handleChange}
                className="block w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            type="submit" disabled={isLoading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 transition-all duration-300"
          >
            {isLoading ? <><Loader2 className="animate-spin h-5 w-5 mr-2" /> Authenticating...</> : 'Sign In to Marketplace'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
            Sign up now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;