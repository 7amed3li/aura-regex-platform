// src/index.ts

// --- Core Dependencies ---
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// --- Database & AI Clients ---
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Middlewares ---
import { loginLimiter } from './middleware/bruteForceProtection.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { authenticateToken } from './middleware/authenticateToken.js';

// --- Route Imports ---
import authRoutes from './routes/authRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import regexRoutes from './routes/regexRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';

// ✅ Newly added (you’ll add these files later)
import testcaseRoutes from './routes/testcaseRoutes.js';
import logRoutes from './routes/generationLogRoutes.js';
import loginAttemptRoutes from './routes/loginAttemptRoutes.js';
import regexAIRoutes from './routes/regexAIRoutes.js';


// --- Initialize Environment ---
dotenv.config();

// --- Initialize App ---
const app: Express = express();
const PORT = process.env.PORT || 8000;

// --- Initialize External Services ---
const prisma = new PrismaClient();

// ✅ Check Environment Keys
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ Warning: GEMINI_API_KEY is missing. AI generation will not work properly.');
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Warning: JWT_SECRET is missing. Authentication may fail.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- Global Middleware Setup ---
// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Security Headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// JSON & URL-encoded Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Global API rate limiter
app.use('/api', apiLimiter);

// ✅ Login-specific brute force protection
app.use('/api/auth/login', loginLimiter);

// --- Health Check ---
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'UP',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({
      status: 'DOWN',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

// --- API Routes Mounting ---
app.use('/api/auth', authRoutes);
app.use('/api/folders', authenticateToken, folderRoutes);
app.use('/api/regex', authenticateToken, regexRoutes);
app.use('/api/rules', authenticateToken, ruleRoutes);
app.use('/api/testcases', authenticateToken, testcaseRoutes);
app.use('/api/generationlogs', authenticateToken, logRoutes);
app.use('/api/loginattempts', authenticateToken, loginAttemptRoutes);
app.use('/api/ai/regex', authenticateToken, regexAIRoutes);

// --- Error Handling Middleware ---
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: 'Sorry, the requested resource was not found.',
    path: req.originalUrl,
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Server Error:', err.stack || err);
  res.status(500).json({
    message: 'Something went wrong on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// --- Database Connection & Server Startup ---
async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    process.exit(1);
  }
}

main();

// Graceful Shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('🔌 Database connection closed.');
});
