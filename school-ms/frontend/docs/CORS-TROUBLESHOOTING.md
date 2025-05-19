# CORS Issue Troubleshooting Guide

This guide addresses the CORS (Cross-Origin Resource Sharing) issues that might occur in the School Management System, particularly with payment processing and authentication.

## Common CORS Problems

### 1. "Request header field cache-control is not allowed by Access-Control-Allow-Headers in preflight response"

This error occurs when the browser sends a preflight OPTIONS request with headers that aren't explicitly allowed by the server.

### 2. Payment submission fails with 400 or 500 status code

This can happen when CORS headers aren't properly configured or when the content type doesn't match what the server expects.

## Quick Fixes

### For Frontend Developers

1. **Use the enhanced payment handler**:
   ```typescript
   import { processPayment } from '../services/paymentHandler';
   
   // This will automatically handle CORS issues
   const result = await processPayment(paymentData);
   ```

2. **Check the network tab** in browser DevTools:
   - Look for failed OPTIONS requests
   - Verify that the `Access-Control-Allow-Headers` response header includes all the headers you're sending

3. **Use the diagnostic tools**:
   ```typescript
   import { diagnoseFeeApiEndpoint } from '../utils/paymentDebugger';
   
   // This will check if the fee endpoints are accessible
   const report = await diagnoseFeeApiEndpoint();
   console.log(report);
   ```

### For Backend Developers

1. **Verify the CORS configuration** in `CorsConfig.java`:
   ```java
   config.setAllowedHeaders(Arrays.asList(
       "Authorization", "Content-Type", "Accept",
       "X-Requested-With", "X-User-Role", "Origin",
       "Access-Control-Request-Method", "Access-Control-Request-Headers",
       "Cache-Control", "cache-control", "CACHE-CONTROL", 
       "Pragma", "pragma", "PRAGMA", 
       "Expires", "expires", "EXPIRES"));
   ```

2. **Handle OPTIONS requests** properly in controllers:
   ```java
   @RequestMapping(method = RequestMethod.OPTIONS)
   public ResponseEntity<?> handleOptions() {
       return ResponseEntity.ok().build();
   }
   ```

3. **Use explicit CORS annotations** on sensitive endpoints:
   ```java
   @CrossOrigin(origins = {"http://localhost:5173", "http://localhost:8080"}, 
                allowedHeaders = {"Authorization", "Content-Type", "Cache-Control"},
                methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
   @PostMapping("/payments")
   public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
       // implementation
   }
   ```

## Advanced Troubleshooting

### Testing CORS without a Browser

Use curl to test CORS configuration:

```bash
# Test preflight request
curl -X OPTIONS -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type, Authorization, Cache-Control" http://localhost:8080/api/fees/payments -v
```

### Using the Debug Tools

The application includes several tools to diagnose CORS issues:

1. **Error reporting service**:
   ```typescript
   import { reportPaymentError } from '../services/errorReporting';
   
   try {
     // Your code
   } catch (error) {
     const diagnostics = reportPaymentError(error, requestData);
     console.log(diagnostics);
   }
   ```

2. **Test different approaches**:
   ```typescript
   import { testPaymentSubmission } from '../utils/paymentDebugger';
   
   const testResult = await testPaymentSubmission(samplePaymentData);
   console.log('Working method:', testResult.workingMethod);
   ```

## Common Error Messages and Solutions

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| Request header field cache-control is not allowed | CORS config missing some header names | Add all variations of cache-control to allowed headers |
| Network Error | CORS preflight failure | Use corsHelper.ts utilities |
| 401 Unauthorized | Token issues | Check auth token format and validity |
| 400 Bad Request | Invalid payment data | Verify all required fields are present |

## Contact Support

If you continue experiencing CORS issues after trying these solutions, please contact support with the diagnostic output from the error reporting service.
