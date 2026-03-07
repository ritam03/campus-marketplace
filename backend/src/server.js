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
    origin: '*', // In production, replace '*' with your React app's Vercel URL
    methods: ['GET', 'POST']
  }
});

// 3. Make 'io' globally accessible to our Express controllers
app.set('io', io);

// 4. Handle Socket Connections
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // User joins a specific chat room (Room ID could be 'listingId_buyerId_sellerId')
  socket.on('join_chat', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle E2EE Chat Messages (Server blindly routes the encrypted payload)
  socket.on('send_message', (data) => {
    // data should contain { roomId, senderId, encryptedMessage }
    socket.to(data.roomId).emit('receive_message', data);
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

    // NOTICE: We use server.listen now, NOT app.listen
    server.listen(PORT, () => {
      console.log(`🚀 Server & WebSockets are listening on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();