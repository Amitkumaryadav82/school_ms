# Backend Connection Troubleshooting Guide

## Error: "Failed to load resource: net::ERR_CONNECTION_REFUSED"

This error indicates that your frontend application cannot connect to the backend server.

## Quick Fix Checklist

1. **Verify backend server is running**
   - Run the `run-backend-fixed.bat` script in the project root
   - Check for any errors in the console output

2. **Check backend server port**
   - Default port is 8080
   - If the server is running on a different port, update `frontend/src/config/environment.ts`

3. **Check for firewall or security software**
   - Temporarily disable any firewall, antivirus, or security software that might be blocking connections
   - Add your application to the allowed list in your security software

4. **Try a different browser**
   - Chrome, Firefox, or Edge may behave differently with local connections

5. **Check network connectivity**
   - Ensure that localhost connections are working by visiting other local services

## Advanced Solutions

### Solution 1: Configure CORS correctly

If the backend is running but rejecting requests due to CORS:

1. In the backend Spring application, verify that CORS is enabled and properly configured:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173") // Vite dev server port
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

2. Ensure the browser isn't blocking cookies or credentials

### Solution 2: Check backend logs

Check the application logs for any errors or warnings:

- Look in `backend/school-app/logs/` directory
- Common issues include database connection problems, missing dependencies, or port conflicts

### Solution 3: Use WSL port forwarding (Windows)

If running backend in WSL and frontend on Windows:

```powershell
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=<WSL-IP>
```

Where `<WSL-IP>` is the IP of your WSL instance (find using `wsl -- ip addr show eth0`).

## How to verify successful connection

1. The browser console should show successful API calls with 200 OK status
2. Visit the Swagger UI at `http://localhost:8080/swagger-ui/index.html` to confirm API is accessible
3. Test the API health endpoint directly: `http://localhost:8080/api/auth/health`
