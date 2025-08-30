import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';
import { requestLogger } from './middleware/logger';

// Load environment configuration first
dotenv.config();

// Initialize JWT configuration early to ensure consistency
import './config/jwt';

const app: Application = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization','ngrok-skip-browser-warning'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use(requestLogger);

// Serve static files from uploads directory (public access, no authentication)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  // Add cache headers for better performance
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  // Set appropriate MIME types
  setHeaders: (res: Response, filePath: string) => {
    if (path.extname(filePath).toLowerCase() === '.jpg' || 
        path.extname(filePath).toLowerCase() === '.jpeg') {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.extname(filePath).toLowerCase() === '.png') {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.extname(filePath).toLowerCase() === '.webp') {
      res.setHeader('Content-Type', 'image/webp');
    }
    // Add CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.use('/api', routes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;