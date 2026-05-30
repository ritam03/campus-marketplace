import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 1. Global Security Middlewares
app.use(helmet()); // Secures HTTP headers

// 🌟 THE FIX: Configured CORS to accept Vercel and Authorization headers
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://campus-marketplace-project.vercel.app' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 

// 2. Rate Limiting (Prevents brute-force attacks)
// Limits each IP to 100 requests per 15 minutes
/* const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { status: 'error', message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', apiLimiter);
*/
// 3. Routes 
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Marketplace API is running smoothly.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/messages', messageRoutes);

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

export default app;