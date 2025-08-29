import { Request, Response, NextFunction } from 'express';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// HTTP method colors
const getMethodColor = (method: string): string => {
  switch (method) {
    case 'GET':
      return colors.green;
    case 'POST':
      return colors.blue;
    case 'PUT':
      return colors.yellow;
    case 'DELETE':
      return colors.red;
    case 'PATCH':
      return colors.magenta;
    default:
      return colors.white;
  }
};

// Status code colors
const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 500) return colors.red;
  if (statusCode >= 400) return colors.yellow;
  if (statusCode >= 300) return colors.cyan;
  if (statusCode >= 200) return colors.green;
  return colors.white;
};

// Get status text
const getStatusText = (statusCode: number): string => {
  const statusTexts: { [key: number]: string } = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
  };
  return statusTexts[statusCode] || 'Unknown';
};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Store request info for later use
  (req as any).startTime = startTime;
  
  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    const methodColor = getMethodColor(req.method);
    const statusColor = getStatusColor(res.statusCode);
    const timestamp = new Date().toISOString();
    
    // Basic single-line log for all requests
    console.log(
      `[${timestamp}] ${methodColor}${req.method}${colors.reset} ${req.originalUrl} → ${statusColor}${res.statusCode} ${getStatusText(res.statusCode)}${colors.reset} (${duration}ms)`
    );
    
    // For errors (4xx, 5xx), show additional details
    if (res.statusCode >= 400) {
      // Log request body (hide sensitive data)
      if (req.body && Object.keys(req.body).length > 0) {
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '***';
        if (sanitizedBody.newPassword) sanitizedBody.newPassword = '***';
        if (sanitizedBody.token) sanitizedBody.token = '***';
        console.log(`  ${colors.dim}Body:${colors.reset}`, sanitizedBody);
      }
      
      // Log error response
      if (body && body.error) {
        console.log(`  ${colors.dim}Error:${colors.reset} ${body.error}`);
      }
    }
    
    return originalJson(body);
  };
  
  next();
};

// Simplified middleware logger - only used for important middleware
export const logMiddleware = (_middlewareName: string) => {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // Removed verbose logging
    next();
  };
};

// Simplified controller action logger
export const logControllerAction = (controllerName: string, action: string, _req: Request): void => {
  // Only log in debug mode
  if (process.env.LOG_LEVEL === 'debug') {
    console.log(`${colors.cyan}[${controllerName}.${action}]${colors.reset}`);
  }
};

// Error logger - keep this for actual errors
export const logError = (error: Error, _req: Request): void => {
  console.error(`${colors.red}[ERROR]${colors.reset} ${error.message}`);
  if (process.env.NODE_ENV === 'development' && error.stack) {
    console.error(`${colors.dim}Stack:${colors.reset}`, error.stack);
  }
};

// Database query logger - removed (handled by Prisma config now)
export const logDatabaseQuery = (_query: string, _params?: any): void => {
  // Removed - Prisma handles this
};