import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import pool from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// 1. Create HTTP Server and bind Express to it
const server = http.createServer(app);

// 2. Initialize Socket.io Server
const io = new Server(server, {
  cors: {
    origin: '*', // Allows connections from your AWS IP and localhost
    methods: ['GET', 'POST']
  }
});

// 3. Make 'io' globally accessible to our Express controllers
app.set('io', io);

// 4. Handle Socket Connections
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // 🌟 FIXED: Added the listener for your global notifications from App.jsx
  socket.on('register_global', (userId) => {
    socket.join(`global_${userId}`);
    console.log(`User ${userId} joined global notifications channel`);
  });

  // User joins a specific chat room
  socket.on('join_chat', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle E2EE Chat Messages
  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data);
    
    // Optional: Also trigger a global notification to the recipient if they aren't in the chat room
    // io.to(`global_${data.recipientId}`).emit('new_message_notification');
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});

// 5. Start Server and DB Ping
const startServer = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    console.log(`✅ Database connected successfully at ${result.rows[0].now}`);

    server.listen(PORT, () => {
      console.log(`🚀 Server & WebSockets are listening on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();