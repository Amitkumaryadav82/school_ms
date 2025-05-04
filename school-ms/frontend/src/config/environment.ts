interface Config {
  apiUrl: string;
  fallbackApiUrl: string;
  swaggerUrl: string;
  apiTimeout: number;
  retryAttempts: number;
}

const development: Config = {
  // During development, we'll still use the full URL for easier local development
  apiUrl: 'http://localhost:8080',
  fallbackApiUrl: 'http://localhost:3000', // Fallback URL in case primary fails
  swaggerUrl: 'http://localhost:8080/swagger-ui/index.html',
  apiTimeout: 10000, // 10 second timeout for API calls
  retryAttempts: 2 // Number of times to retry failed requests
};

const production: Config = {
  // In production (monolithic app), use window.location.origin to ensure correct base URL
  apiUrl: window.location.origin,  // This ensures we use the same origin the app is served from
  fallbackApiUrl: '', // No need for fallback in monolithic app
  swaggerUrl: '/swagger-ui/index.html',
  apiTimeout: 15000, // 15 second timeout for API calls in production
  retryAttempts: 3
};

// This section determines which configuration to use
let config: Config;

// In a development environment
if (import.meta.env.MODE !== 'production') {
  config = development;
} 
// In a production environment
else {
  config = production;
}

export default config;