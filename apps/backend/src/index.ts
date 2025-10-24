// src/index.ts

// Core Dependencies
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan'; // Logger
import helmet from 'helmet'; // Basic security
import rateLimit from 'express-rate-limit'; // Rate limiting
import dotenv from 'dotenv';

// Prisma Client
import { PrismaClient } from '@prisma/client';

// Google Generative AI
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- INITIAL CONFIGURATIONS ---
dotenv.config();

// --- INITIALIZE APP ---
const app: Express = express();
const PORT = process.env.PORT || 8000;

// --- INITIALIZE EXTERNAL SERVICES ---
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- MIDDLEWARE SETUP ---

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions ));

// Security Headers
app.use(helmet());

// Request Logging
app.use(morgan('dev'));

// JSON Body Parser
app.use(express.json());

// URL-encoded Body Parser
app.use(express.urlencoded({ extended: true }));

// Rate Limiter: Prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter); // Apply to all API routes

// --- API ROUTES ---
import authRoutes from './routes/authRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import regexRoutes from './routes/regexRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'UP', 
    timestamp: new Date().toISOString() 
  });
});

// --- ERROR HANDLING MIDDLEWARE ---
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/regex', regexRoutes);
app.use('/api/rules', ruleRoutes);
// 404 Not Found Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Sorry, the requested resource was not found." });
});

// Global Error Handler (500)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Log error stack for debugging
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

// --- DATABASE CONNECTION & SERVER STARTUP ---
async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully.');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}` );
    });

  } catch (error) {
    console.error('❌ Failed to connect to the database', error);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Database connection closed.');
});
