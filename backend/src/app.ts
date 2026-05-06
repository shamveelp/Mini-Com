import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import routes from './routes/index.js';

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

// API Routes
app.use('/api', routes);

// Base Route
app.get('/', (req: Request, res: Response) => {
  res.send('Mini-Com API is running...');
});

export default app;
