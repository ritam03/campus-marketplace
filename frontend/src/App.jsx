import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PostItem from './pages/PostItem';
import ItemDetail from './pages/ItemDetail';
import Chat from './pages/Chat';
import { useAppStore } from './store/useAppStore';

function App() {
  const { connectSocket, disconnectSocket, isAuthenticated, user, setUnreadMessageCount, unreadMessageCount } = useAppStore();

  useEffect(() => {
    connectSocket();
    const currentSocket = useAppStore.getState().socket;

    if (isAuthenticated && user) {
      // 1. Register this specific user for site-wide background notifications
      currentSocket.emit('register_global', user.id);
      
      // 2. Listen for incoming message alerts
      const handleNewNotification = () => {
        setUnreadMessageCount(useAppStore.getState().unreadMessageCount + 1);
        toast('You received a new secure message!', { 
          icon: '💬', 
          style: { background: '#3b82f6', color: '#fff' } 
        });
      };

      currentSocket.on('new_message_notification', handleNewNotification);

      return () => {
        currentSocket.off('new_message_notification', handleNewNotification);
      };
    }

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket, isAuthenticated, user, setUnreadMessageCount]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-gray-50">
        <Navbar />
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
            success: { theme: { primary: '#4aed88' } },
          }}
        />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Landing />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
            <Route path="/post-item" element={isAuthenticated ? <PostItem /> : <Navigate to="/login" />} />
            <Route path="/item/:id" element={isAuthenticated ? <ItemDetail /> : <Navigate to="/login" />} />
            <Route path="/chat/:listingId/:otherUserId" element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;