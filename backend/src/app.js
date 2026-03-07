import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();

// 1. Global Security Middlewares
app.use(helmet()); // Secures HTTP headers
app.use(cors()); 
app.use(express.json()); 

// 2. Rate Limiting (Prevents brute-force attacks)
// Limits each IP to 100 requests per 15 minutes
/*const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { status: 'error', message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', apiLimiter);
*/
// 3. Routes (We will add the auth routes here shortly)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Marketplace API is running smoothly.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/messages', messageRoutes);

export default app;