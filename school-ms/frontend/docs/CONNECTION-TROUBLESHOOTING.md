# Connection Troubleshooting Features

This document provides an overview of the connection troubleshooting features added to the School Management System to help diagnose and resolve backend connectivity issues.

## Overview

The School Management System now includes several features to help users diagnose and troubleshoot connection issues between the frontend and backend. These features include:

1. **Connection Status Indicator**: A real-time indicator showing the current connection status
2. **Connection Settings**: A UI component for configuring API connection settings
3. **Connection Diagnostics Tool**: A comprehensive diagnostics tool for troubleshooting connection issues
4. **Automatic API URL Detection**: A feature that tries multiple common ports to find the correct API URL
5. **Improved Error Handling**: Better error messages and handling of network errors
6. **Network Error Boundaries**: Components to catch and handle network-related errors

## How to Use

### Connection Status Indicator

The Connection Status Indicator is displayed in the top navigation bar and shows whether the frontend is currently connected to the backend:

- **Green Icon**: Connected to the backend
- **Red Icon**: Unable to connect to the backend
- **Gray Icon**: Connection status unknown or being checked

Clicking on the indicator shows additional options:
- **Check connection now**: Manually test the connection
- **Connection settings**: Open the connection settings dialog
- **View API docs**: Open the API documentation page

### Connection Settings

To access the Connection Settings:

1. Click on the Connection Status Indicator in the navigation bar
2. Select "Connection settings" from the menu
3. Or go to the Connection Diagnostics Page and click "Connection Settings"

The Connection Settings dialog allows you to:
- View the current API URL
- Set a custom API URL
- Reset to the default API URL
- Enable automatic API detection
- Save your settings for future sessions

### Connection Diagnostics Tool

To access the Connection Diagnostics Tool:

1. Click on your profile icon in the navigation bar
2. Select "Connection Diagnostics" from the menu
3. Or navigate to `/diagnostics` directly in your browser

The diagnostics tool provides:
- Detailed connectivity tests to the backend server
- Authentication endpoint checks
- Network configuration information
- Troubleshooting suggestions based on detected issues
- Options to fix common connectivity problems

### Error Handling

When a network error occurs:

1. The specific error type is identified
2. User-friendly error messages are displayed
3. Suggestions for resolving the issue are provided
4. Options to retry the connection or adjust settings are presented

### Automatic API URL Detection

The system will automatically try to detect the correct API URL on startup:
- It will check common ports like 8080, 8081, 8000, etc.
- When a working URL is found, it will be saved and used
- A notification will appear if the API URL has been automatically updated
- You can disable this feature in the Connection Settings

## Troubleshooting Common Issues

### ERR_CONNECTION_REFUSED

This error indicates that the frontend cannot connect to the backend server. Possible solutions:

1. Check if the backend server is running
2. Verify the API URL in Connection Settings
3. Check for firewall or network issues
4. Make sure the backend server is listening on the expected port

### CORS Errors

Cross-Origin Resource Sharing errors may prevent proper communication:

1. Ensure the backend has proper CORS headers configured
2. Verify that the frontend origin is allowed in the backend CORS configuration
3. Check browser console for specific CORS error details

### Authentication Issues

If you're experiencing authentication problems:

1. Check if your token is valid and not expired
2. Try logging out and logging back in
3. Clear your browser's local storage and cookies
4. Use the Connection Diagnostics Tool to test authentication endpoints

## For Developers

The connection management system includes:

- `connectivityCheck.ts`: Core utility for testing backend connectivity
- `ConnectionStatusIndicator.tsx`: UI component for displaying connection status
- `ConnectionSettings.tsx`: UI for configuring connection settings
- `ConnectionDiagnosticsTool.tsx`: Comprehensive diagnostic utility
- `NetworkErrorBoundary.tsx`: React error boundary for network errors
- `ConnectionError.tsx`: Component for displaying connection error messages

Error handling has been improved by:
1. Identifying specific network-related error types
2. Providing custom UI components for different error scenarios
3. Offering self-service troubleshooting options to users
4. Automatically attempting connection recovery