import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import razorpayInstance from './config/razorpay.js';

dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Request Logger Middleware
app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Connect to Database
connectDB();

// Static Products Data
const products = [
  { 
    id: "1",
    name: "Mini-Com Pro", 
    description: "Studio-grade precision for professionals.", 
    price: 28999, 
    image: "/images/headset-black.png", 
    tag: "Flagship" 
  },
  { 
    id: "2",
    name: "Mini-Com Air", 
    description: "Feather-light comfort for all-day use.", 
    price: 19999, 
    image: "/images/headset-white.png", 
    tag: "Essential" 
  },
  { 
    id: "3",
    name: "Mini-Com Classic", 
    description: "The original legend, refined for the modern age.", 
    price: 15999, 
    image: "/images/main.webp", 
    tag: "Iconic" 
  }
];

// Routes
app.post('/api/orders', async (req: Request, res: Response) => {
  const { amount, currency = 'INR', receipt } = req.body;

  try {
    const options = {
      amount: amount, // Frontend should pass the amount. Note: we multiply by 100 below if needed or assume it's already in INR units.
      // Actually, Razorpay expects amount in PASE. Let's handle it here.
    };

    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(orderOptions);
    logger.info(`Razorpay Order Created: ${order.id}`);
    res.json(order);
  } catch (error: any) {
    logger.error(`Razorpay Order Error: ${error.message}`);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
});

app.get('/api/products', (req: Request, res: Response) => {
  res.json(products);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Mini-Com API is running with static data...');
});

export default app;
