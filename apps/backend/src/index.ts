// src/index.ts

// =============================================================================
// 1. Core Dependencies & Configuration
// =============================================================================
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import compression from 'compression';

// --- Database Client ---
import { PrismaClient } from '@prisma/client';

// --- Middleware Imports ---
import { loginLimiter } from './middleware/bruteForceProtection.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { authenticateToken } from './middleware/authenticateToken.js';

// --- Route Imports ---
import authRoutes from './routes/authRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import regexRoutes from './routes/regexRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';

// ✅ تم تفعيل استيراد المسارات الجديدة (Uncommented)
import testcaseRoutes from './routes/testcaseRoutes.js';
import logRoutes from './routes/generationLogRoutes.js';
import loginAttemptRoutes from './routes/loginAttemptRoutes.js';
import regexAIRoutes from './routes/regexAIRoutes.js';
import userRoutes from './routes/userRoutes.js';

// --- Initialize Environment ---
dotenv.config();

// =============================================================================
// 2. App Initialization & Environment Checks
// =============================================================================
const app: Express = express();
const PORT = process.env.PORT || 8000;
const prisma = new PrismaClient();

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`🚨 CRITICAL ERROR: Missing environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// =============================================================================
// 3. Global Middleware Setup
// =============================================================================

app.use(helmet());
app.disable('x-powered-by');

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// =============================================================================
// 4. Routes Mounting
// =============================================================================

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'UP', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'DOWN', database: 'disconnected' });
  }
});

// ✅ تركيب المسارات الأساسية
app.use('/api/auth', authRoutes);
app.use('/api/folders', authenticateToken, folderRoutes);
app.use('/api/regex', authenticateToken, regexRoutes);
app.use('/api/rules', authenticateToken, ruleRoutes);

// ✅ تركيب المسارات الجديدة (تم تفعيلها الآن)
// هذه المسارات ضرورية لعمل الداشبورد والذكاء الاصطناعي
app.use('/api/testcases', authenticateToken, testcaseRoutes);
app.use('/api/logs', authenticateToken, logRoutes);
app.use('/api/loginattempts', authenticateToken, loginAttemptRoutes);
app.use('/api/ai/regex', authenticateToken, regexAIRoutes);
app.use('/api/users', authenticateToken, userRoutes); // ✅ User Management Routes

// =============================================================================
// 5. Global Error Handling
// =============================================================================

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource '${req.originalUrl}' was not found on this server.`,
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Server Error:', err.stack || err);
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  res.status(500).json({ error: 'Internal Server Error', message });
});

// =============================================================================
// 6. Server Startup
// =============================================================================

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
}

startServer();