# Connection Management System

This document provides a comprehensive overview of the connection management system in the School Management System application.

## Architecture

The connection management system uses a centralized context-based approach to manage and monitor the connection state between the frontend and backend. It consists of the following key components:

### Core Components

1. **ConnectionContext**: A React context that provides connection state and methods to all components
2. **ConnectionProvider**: The provider that wraps the application and manages connection state
3. **useConnection**: A hook for functional components to access the connection context
4. **ConnectionStatusIndicator**: UI component that displays the current connection status in the top bar
5. **ConnectionSettings**: A dialog for configuring API connection settings
6. **ConnectionDiagnosticsTool**: A comprehensive diagnostics tool for troubleshooting connection issues
7. **ConnectionError**: A component for displaying connection error messages
8. **NetworkErrorBoundary**: React error boundary specifically for network-related errors
9. **GlobalConnectionSettings**: Provides access to connection settings from anywhere in the app

### Utilities

1. **connectivityCheck.ts**: Core utility with functions to test backend connectivity and handle API URL detection
2. **authDiagnostic.ts**: Utility to test authentication endpoints and diagnose CORS issues

## How It Works

### Connection State Management

The `ConnectionContext` maintains the following state:

```typescript
interface ConnectionState {
  connected: boolean;       // Whether currently connected to the backend
  checking: boolean;        // Whether a connection check is in progress
  lastChecked: Date | null; // When the connection was last checked
  apiUrl: string;           // The current API URL
  workingUrl: string | null; // Alternative working URL if found
  error: string | null;     // Error message if connection failed
}
```

### Connection Detection

On application startup:

1. The `ConnectionProvider` initializes and checks for stored API URLs
2. It attempts to connect to the backend using the configured URL
3. If that fails, it tries common alternative ports (8080, 8081, etc.)
4. If a working URL is found, it's stored and used
5. Connection status is maintained and periodically checked

### Error Handling

When network errors occur:

1. The `NetworkErrorBoundary` catches errors that might be connection-related
2. It uses the connection context to check if the backend is reachable
3. If not, it shows appropriate error messages with options to retry or open settings
4. The `ConnectionError` component provides detailed error information

### User Interface

1. The connection status is always visible in the navigation bar
2. Users can manually check connections, open settings, or view API docs
3. The connection settings dialog lets users:
   - View and change the API URL
   - Select from common ports
   - Test connections before applying
   - Reset to default settings

## Usage Guide

### Accessing Connection State

```tsx
import { useConnection } from '../context/ConnectionContext';

const MyComponent = () => {
  const { connectionState } = useConnection();
  
  return <div>Connected: {connectionState.connected ? 'Yes' : 'No'}</div>;
};
```

### Checking Connection

```tsx
import { useConnection } from '../context/ConnectionContext';

const MyComponent = () => {
  const { checkConnection } = useConnection();
  
  const handleClick = async () => {
    const isConnected = await checkConnection();
    if (isConnected) {
      console.log('Connected to backend!');
    } else {
      console.log('Connection failed');
    }
  };
  
  return <button onClick={handleClick}>Check Connection</button>;
};
```

### Opening Connection Settings

```tsx
import { useConnection } from '../context/ConnectionContext';

const MyComponent = () => {
  const { setShowConnectionSettings } = useConnection();
  
  return (
    <button onClick={() => setShowConnectionSettings(true)}>
      Open Settings
    </button>
  );
};
```

### Updating API URL

```tsx
import { useConnection } from '../context/ConnectionContext';

const MyComponent = () => {
  const { updateApiUrl } = useConnection();
  
  const handleUpdateUrl = async () => {
    const success = await updateApiUrl('http://localhost:8081');
    if (success) {
      console.log('API URL updated successfully!');
    }
  };
  
  return <button onClick={handleUpdateUrl}>Use Port 8081</button>;
};
```

## Error Handling Guide

The system includes specific error handling for different types of connection issues:

1. **ERR_CONNECTION_REFUSED**: Server is not running or unreachable
2. **CORS Errors**: Misconfigured Cross-Origin Resource Sharing
3. **Network Offline**: Device is not connected to the internet
4. **Timeout Issues**: Server is too slow to respond
5. **Authentication Errors**: Problems with JWT tokens or auth endpoints

## Future Enhancements

- WebSocket-based real-time connection monitoring
- Service worker integration for offline support
- More detailed network diagnostics
- Performance metrics tracking
- Automatic reconnection strategies
