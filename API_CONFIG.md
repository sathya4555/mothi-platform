# API Configuration

This document describes the centralized API configuration used across the Mothi Platform.

## Backend URL

The backend is deployed on Railway at:
```
https://mothi-platform-production.up.railway.app
```

## Configuration Files

### Web App (`apps/web/src/config/api.ts`)
- Centralized API configuration for the React web application
- Contains BASE_URL, endpoints, and helper functions
- Used by all web services

### Mobile App (`apps/mobile/src/services/config.ts`)
- Centralized API configuration for the React Native mobile app
- Contains BASE_URL, endpoints, and axios interceptors
- Used by all mobile services

### Backend CORS (`apps/backend/src/main.ts`)
- CORS configuration includes the production URL
- Allows requests from the production frontend

## Usage

### In Web Services
```typescript
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/config/api';

// Use the base URL
const url = API_CONFIG.BASE_URL;

// Get full API URL
const loginUrl = getApiUrl('/auth/login');

// Get auth headers
const headers = getAuthHeaders(token);
```

### In Mobile Services
```typescript
import { API_CONFIG, getApiUrl, getAuthHeaders } from '@/services/config';

// Use the base URL
const url = API_CONFIG.BASE_URL;

// Get full API URL
const loginUrl = getApiUrl('/auth/login');

// Get auth headers
const headers = getAuthHeaders(token);
```

## Environment Variables

The web app supports overriding the API URL using environment variables:

```bash
# .env file
VITE_API_BASE_URL=https://mothi-platform-production.up.railway.app
```

## Endpoints

Common endpoints are defined in the configuration:

- **Auth**: `/auth/login`, `/auth/register`, `/auth/profile`
- **Users**: `/users`
- **Parties**: `/parties`
- **Products**: `/products`
- **Subcategories**: `/products/subcategories`
- **Purchases**: `/purchases`

## Updating the Backend URL

To change the backend URL:

1. Update `apps/web/src/config/api.ts`
2. Update `apps/mobile/src/services/config.ts`
3. Update `apps/backend/src/main.ts` CORS origins
4. Update any environment variables if needed

This ensures consistency across all applications. 