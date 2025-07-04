interface Config {
  apiUrl: string;
  fallbackApiUrl: string;
  swaggerUrl: string;
  apiTimeout: number;
  retryAttempts: number;
  corsConfig: {
    enabled: boolean;
    supportedOrigins: string[];
  };
}

const development: Config = {
  // Use relative URLs to leverage Vite proxy configuration
  apiUrl: '',  // Empty string means use relative URLs with Vite proxy
  fallbackApiUrl: 'http://localhost:8080', // Direct fallback to backend if proxy fails
  swaggerUrl: 'http://localhost:8080/swagger-ui/index.html',
  apiTimeout: 15000, // Extended to 15 seconds for debugging
  retryAttempts: 2, // Number of times to retry failed requests
  corsConfig: {
    enabled: true,
    supportedOrigins: [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ]
  }
};

const production: Config = {
  // In production (monolithic app), use window.location.origin to ensure correct base URL
  apiUrl: window.location.origin,  // This ensures we use the same origin the app is served from
  fallbackApiUrl: '', // No need for fallback in monolithic app
  swaggerUrl: '/swagger-ui/index.html',
  apiTimeout: 15000, // 15 second timeout for API calls in production
  retryAttempts: 3,
  corsConfig: {
    enabled: false, // Not needed in production as we're using the same origin
    supportedOrigins: [window.location.origin]
  }
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

// Apply any stored API URL from previous connectivity checks
// This function is imported at the end of the file to avoid circular imports
setTimeout(() => {
  import('../utils/connectivityCheck').then(({ applyStoredApiUrl }) => {
    applyStoredApiUrl();
    console.log(`Current API URL configuration: ${config.apiUrl}`);
  }).catch(err => console.error('Failed to import connectivity checker', err));
}, 0);

export default config;