# Asset Path Helper Documentation

## Overview
The application uses a dynamic base path configuration that is managed through environment variables. This allows for flexible deployment to different environments without hardcoding paths.

## Environment Configuration

The base path is controlled by the `VITE_APP_BASE` environment variable:

```bash
# .env file
VITE_APP_BASE=/wezo-homeowner  # For subdirectory deployment
# or
VITE_APP_BASE=/              # For root deployment
```

## Usage Examples

### For Client-Side Assets (images, static files)
```typescript
import { resolveAssetPath, getClientBaseUrl } from '@/utils/api';

// Example 1: Referencing a local image
const logoPath = resolveAssetPath('/images/logo.png');
// Result: {VITE_APP_BASE}/images/logo.png

// Example 2: In a component
<img src={resolveAssetPath('/assets/hero-image.jpg')} alt="Hero" />

// Example 3: Background image
<div style={{ backgroundImage: `url(${resolveAssetPath('/backgrounds/pattern.svg')})` }} />

// Example 4: Get the current base URL
const baseUrl = getClientBaseUrl();
```

### For API/Server Photos
```typescript
import { resolvePhotoUrl } from '@/utils/api';

// This is for photos uploaded to the server
const photoUrl = resolvePhotoUrl(photo.url);
// If photo.url = '/uploads/photo1.jpg'
// Result: http://192.168.1.68:3000/uploads/photo1.jpg
```

## Important Notes

1. **Client Assets vs Server Assets**:
   - Use `resolveAssetPath()` for client-side assets (in public folder)
   - Use `resolvePhotoUrl()` for server-uploaded photos

2. **Environment Variables**:
   - `VITE_APP_BASE`: Controls the application base path
   - `VITE_API_BASE_URL`: Controls the API server URL
   - Both are configurable per environment

3. **Development vs Production**:
   - The base path is dynamically loaded from environment variables
   - Vite automatically handles the base path for imports and public assets
   - The helper functions ensure runtime paths are correct

4. **Router Configuration**:
   - The router is configured with `basepath` from `VITE_APP_BASE`
   - All routes automatically include this prefix

## Configuration Files

- **.env**: Contains environment-specific variables
- **vite.config.ts**: Dynamically reads `VITE_APP_BASE`
- **router.tsx**: Dynamically reads `VITE_APP_BASE`
- **utils/api.ts**: Contains helper functions for path resolution

## Deployment Examples

### Root Deployment
```bash
VITE_APP_BASE=/
```

### Subdirectory Deployment
```bash
VITE_APP_BASE=/wezo-homeowner
```

### Custom Path
```bash
VITE_APP_BASE=/my-custom-path
```