# Authentication Flow Documentation

## Overview
This document outlines the enhanced authentication flow implemented in the School Management System to address the issue where Admin users were being immediately logged out after clicking on the dashboard.

## Key Components

### Token Management
The authentication system uses JWT (JSON Web Token) for stateless authentication. The following improvements have been made:

#### 1. Token Validation
- All tokens retrieved from localStorage are validated for:
  - Proper JWT format
  - Expiration time
  - Role permissions

#### 2. Token Refresh Mechanism
- Automatic token refresh occurs when:
  - Token has expired
  - Token is about to expire (< 5 min remaining)
  - Permission-related errors occur for Admin users

#### 3. Backend Support
- Added a `/api/auth/refresh` endpoint that:
  - Validates the existing token
  - Issues a new token with refreshed expiration time
  - Returns updated user details if necessary

### Front-end Components

#### AuthContext
- Validates token on initial app load
- Implements inactivity timeout (10 min)
- Tracks user activity across the application
- Provides current user data with properly formatted role information

#### RoleBasedRoute
- Enhanced to handle role arrays and single role strings
- Special handling for Admin users to prevent incorrect authorization failures
- Detailed logging for debugging access issues

#### API Service
- Improved error handling for 401 Unauthorized responses
- Configurable retry mechanism with token refresh
- Detailed diagnostics for debugging authentication failures

#### tokenRefreshService
- Handles token refreshing without causing circular imports
- Implements request queueing during refresh operations
- Detailed logging of refresh attempts and failures

#### userPreferencesService
- Tracks user preferences
- Logs authentication and access events
- Provides diagnostic information for troubleshooting

## Authentication Flow

1. **Initial Authentication**:
   - User logs in via login form
   - Server validates credentials and returns JWT + user data
   - Token and user data stored in localStorage

2. **Session Validation**:
   - On application start/reload, token is validated
   - If valid, user remains authenticated
   - If expired but refreshable, token is refreshed
   - If invalid, user is redirected to login

3. **During User Session**:
   - Token automatically refreshed when needed
   - User activity resets inactivity timer
   - API errors related to authentication trigger refresh attempts

4. **Admin User Special Handling**:
   - Additional role-checking logic for Admin users
   - Provisional access granted to Admin users even with role mismatch
   - Token refresh attempted to correct role information

## Debugging Authentication Issues

For administrators and developers, the following tools are available:

1. **Console Logging**:
   - Detailed logs for token validation, refresh, and API calls
   - Role checking and permission verification logs

2. **User Preferences Service**:
   - Access logs stored in local storage
   - Token refresh history available for review
   - Debug mode can be enabled for additional logging

3. **API Error Handling**:
   - Detailed error messages for authentication issues
   - Custom error types for different authentication failure scenarios

## Best Practices

1. Always verify token validity before making API calls
2. Use the RoleBasedRoute component for access control
3. Handle 401 errors gracefully with user feedback
4. Implement token refresh proactively before expiration
5. Use the logging capabilities for troubleshooting

## Known Limitations

1. Refresh tokens are not currently implemented (single token system)
2. No persistent server-side session tracking
3. Mobile devices may have localStorage limitations
4. Debug logs are cleared when browser storage is cleared
