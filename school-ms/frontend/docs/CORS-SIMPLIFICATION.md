# CORS Configuration Simplification

This document outlines the simplification made to the CORS (Cross-Origin Resource Sharing) configuration in the School Management System.

## Previous Issues

The system previously had several overlapping CORS configurations:

1. `WebSecurityConfig.java` with an `extendedCorsFilter`
2. `SecurityConfig.java` with inline CORS configuration 
3. `CorsConfig.java` with another CORS filter
4. `@CrossOrigin` annotation on `AuthController`
5. Settings in `application.properties`

This led to several problems:
- Inconsistent CORS behavior
- Difficulty troubleshooting CORS issues
- Multiple places to update when adding new origins
- Redundant code

## Simplified Configuration

We've consolidated all CORS configuration into a single source of truth:

### 1. Centralized CorsConfig

The `CorsConfig.java` file now serves as the single CORS configuration source, using values from `application.properties`:

```java
@Configuration
@Order(1)
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:8080,http://localhost:5173,http://localhost:5174,http://localhost:3000}")
    private String allowedOriginsStr;

    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
    private String allowedMethodsStr;

    @Value("${cors.max-age:3600}")
    private long maxAge;

    @Bean(name = "corsFilter")
    public CorsFilter corsFilter() {
        // Implementation here
    }
}
```

### 2. Removed Redundant Configurations

- Removed `@CrossOrigin` annotation from `AuthController`
- Simplified `WebSecurityConfig.java` to a placeholder
- Updated `SecurityConfig.java` to use the centralized CORS filter instead of inline configuration

### 3. Property-Driven Configuration

All CORS settings now come from `application.properties` where possible:

```properties
# CORS Configuration
cors.allowed-origins=http://localhost:8080,http://localhost:5173,http://localhost:5174
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.allowed-headers=Authorization,Content-Type,X-Requested-With,X-Admin-Override
cors.max-age=3600
```

## Developer Notes

### Adding New Origins

To add a new allowed origin, just update the `cors.allowed-origins` property in `application.properties`.

### Debugging CORS Issues

1. Use the browser's developer tools Network tab to check for CORS errors
2. The application includes a diagnostic utility: `authDiagnostic.ts`
3. Check `CORS-TROUBLESHOOTING.md` and `CORS-DEBUGGING.md` for additional guidance

### Testing

After making changes to CORS configuration:

1. Test login functionality
2. Test API calls that require authentication
3. Verify that API calls work from all supported frontend origins
4. Check that preflight OPTIONS requests are handled correctly

## Benefits

- Single responsibility: One class handles CORS configuration
- Easier maintenance: One place to update
- Environment-specific configuration through properties
- Consistent behavior across all endpoints
- Better diagnostics for CORS issues
