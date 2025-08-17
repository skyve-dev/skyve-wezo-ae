# Environment Configuration Guide

## Overview

The client application uses environment variables to configure deployment settings, making it flexible for different environments without hardcoding values.

## Environment Variables

### Required Variables

| Variable | Description | Example Values |
|----------|-------------|----------------|
| `VITE_API_BASE_URL` | Backend API server URL | `http://localhost:3000`, `https://api.wezo.ae` |
| `VITE_APP_BASE` | Application base path | `/`, `/wezo-homeowner`, `/my-app` |

### File Structure

```
client/
├── .env                 # Default environment variables
├── .env.development     # Development-specific variables
├── .env.production      # Production-specific variables (create if needed)
└── .env.example         # Template for new environments
```

## Configuration Examples

### Development Environment (`.env.development`)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Application Base Path
VITE_APP_BASE=/wezo-homeowner
```

### Production Environment (`.env.production`)
```bash
# API Configuration
VITE_API_BASE_URL=https://api.wezo.ae

# Application Base Path (if deployed to subdirectory)
VITE_APP_BASE=/wezo-homeowner

# Or for root deployment
# VITE_APP_BASE=/
```

### Local Development with Network Access (`.env`)
```bash
# API Configuration (using network IP)
VITE_API_BASE_URL=http://192.168.1.68:3000

# Application Base Path
VITE_APP_BASE=/wezo-homeowner
```

## Deployment Scenarios

### 1. Root Domain Deployment
Deploy the app at the root of a domain (e.g., `https://wezo.ae/`)

```bash
VITE_APP_BASE=/
```

### 2. Subdirectory Deployment
Deploy the app in a subdirectory (e.g., `https://mysite.com/wezo-homeowner/`)

```bash
VITE_APP_BASE=/wezo-homeowner
```

### 3. Custom Path Deployment
Deploy the app with a custom path (e.g., `https://company.com/rental-app/`)

```bash
VITE_APP_BASE=/rental-app
```

## How It Works

### 1. Vite Configuration
The `vite.config.ts` file reads `VITE_APP_BASE` and configures the build:

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_APP_BASE || '/'
  
  return {
    base: base.endsWith('/') ? base : `${base}/`,
    // ... other config
  }
})
```

### 2. Router Configuration
The `router.tsx` file uses the environment variable for routing:

```typescript
const getBasePath = () => {
  const base = import.meta.env.VITE_APP_BASE || '/'
  return base === '/' ? undefined : base.replace(/\/$/, '')
}

export const router = createRouter({ 
  basepath: getBasePath(),
  // ... other config
})
```

### 3. Asset Resolution
The `utils/api.ts` provides helpers for asset paths:

```typescript
export const resolveAssetPath = (path: string): string => {
  const base = import.meta.env.VITE_APP_BASE || '/'
  // ... resolution logic
}
```

## Best Practices

### 1. Environment File Management
- Never commit sensitive data to `.env` files
- Use `.env.example` as a template for team members
- Create environment-specific files (`.env.production`, `.env.staging`)

### 2. Path Configuration
- Always include leading slash for non-root paths: `/wezo-homeowner`
- Don't include trailing slashes in `VITE_APP_BASE`: use `/wezo-homeowner`, not `/wezo-homeowner/`
- The system automatically handles trailing slashes where needed

### 3. Development Setup
- Copy `.env.example` to `.env` and customize for your setup
- Update IP addresses for network testing
- Use different ports if needed to avoid conflicts

## Troubleshooting

### Issue: Assets not loading
**Solution**: Check that `VITE_APP_BASE` matches your deployment path

### Issue: Routing not working in production
**Solution**: Ensure your web server is configured to serve the app from the correct base path

### Issue: API calls failing
**Solution**: Verify `VITE_API_BASE_URL` points to the correct backend server

### Issue: Different behavior in development vs production
**Solution**: Make sure environment files are correctly configured for each environment

## Development Commands

```bash
# Start with default environment
npm run dev

# Start with specific environment (if configured)
npm run dev -- --mode production

# Build for production
npm run build

# Preview production build
npm run preview
```

The preview command will serve the built application with the same base path configuration.