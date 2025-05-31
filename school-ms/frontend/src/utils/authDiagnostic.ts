/**
 * CORS and Authentication Diagnostic Utilities
 * 
 * This module provides tools to diagnose CORS and authentication issues
 * in the School Management System.
 */
import axios from 'axios';
import config from '../config/environment';

/**
 * Interface for diagnostic results
 */
interface DiagnosticResult {
  corsIssues: boolean;
  networkIssues: boolean;
  authEndpointAvailable: boolean;
  apiPrefixIssues: boolean;
  tokenFormatIssues: boolean;
  problems: Array<{
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<string>;
  timestamp: string;
}

/**
 * Run a series of diagnostic checks for authentication issues
 */
export const runAuthDiagnostics = async (): Promise<DiagnosticResult> => {
  const diagnostics: DiagnosticResult = {
    corsIssues: false,
    networkIssues: false,
    authEndpointAvailable: false,
    apiPrefixIssues: false,
    tokenFormatIssues: false,
    problems: [],
    recommendations: [],
    timestamp: new Date().toISOString()
  };

  try {
    console.log('🔍 Running authentication diagnostics...');

    // Step 1: Check if the API is reachable at all
    try {
      const apiCheckUrl = `${config.apiUrl}/api/auth/health`;
      
      console.log(`Checking API availability at ${apiCheckUrl}...`);
      await axios.get(apiCheckUrl, { timeout: 5000 });
      
      diagnostics.authEndpointAvailable = true;
      console.log('✅ API appears to be reachable.');
    } catch (error: any) {
      console.log('❌ Initial API check failed:', error.message);
      
      // Also try with fallback URL if configured
      if (config.fallbackApiUrl) {
        try {
          const fallbackUrl = `${config.fallbackApiUrl}/api/auth/health`;
          console.log(`Trying fallback URL: ${fallbackUrl}`);
          await axios.get(fallbackUrl, { timeout: 5000 });
          
          diagnostics.problems.push({
            type: 'api_url',
            description: 'Primary API URL failed but fallback worked. Check API URL configuration.',
            severity: 'high'
          });
          
          diagnostics.recommendations.push('Update API URL configuration to use the fallback URL.');
          console.log('✅ Fallback API URL is working.');
        } catch (fallbackError) {
          console.log('❌ Fallback API URL also failed.');
          diagnostics.networkIssues = true;
          diagnostics.problems.push({
            type: 'network',
            description: 'Unable to reach API at both primary and fallback URLs.',
            severity: 'high'
          });
          diagnostics.recommendations.push('Check network connectivity and API server status.');
        }
      } else {
        diagnostics.networkIssues = true;
        diagnostics.problems.push({
          type: 'network',
          description: 'Unable to reach API. Server may be down or network issues exist.',
          severity: 'high'
        });
        diagnostics.recommendations.push('Verify API server is running and accessible.');
      }
    }

    // Step 2: Test a CORS preflight request
    try {
      // This makes an OPTIONS request which will test CORS preflight
      const corsCheckOptions = {
        method: 'OPTIONS',
        url: `${config.apiUrl}/api/auth/login`,
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization,Cache-Control',
          'Origin': window.location.origin
        }
      };
      
      console.log('Testing CORS preflight request...');
      await axios(corsCheckOptions);
      console.log('✅ CORS preflight check passed.');
    } catch (error: any) {
      console.log('❌ CORS preflight check failed:', error.message);
      diagnostics.corsIssues = true;
      diagnostics.problems.push({
        type: 'cors',
        description: 'CORS preflight request failed. Server may not allow your origin.',
        severity: 'high'
      });
      diagnostics.recommendations.push('Ensure CORS is properly configured on the server.');
      diagnostics.recommendations.push(`Add "${window.location.origin}" to allowed origins.`);
    }

    // Step 3: Check token format if available
    const token = localStorage.getItem('token');
    if (token) {
      if (!token.startsWith('Bearer ') && !token.match(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)) {
        diagnostics.tokenFormatIssues = true;
        diagnostics.problems.push({
          type: 'token_format',
          description: 'Token format appears invalid.',
          severity: 'medium'
        });
        diagnostics.recommendations.push('Clear browser localStorage and log in again.');
      } else {
        console.log('✅ Token format appears valid.');
      }
    }

    // Step 4: Check if there might be API prefix confusion
    try {
      // Try a request with double /api/ prefix to see if that's the issue
      const apiPrefixCheckUrl = `${config.apiUrl}/api/api/auth/health`;
      console.log(`Checking for API prefix issues with ${apiPrefixCheckUrl}...`);
      
      const prefixCheckResult = await axios.get(apiPrefixCheckUrl, { 
        timeout: 5000,
        validateStatus: () => true // Accept any status code
      });
      
      // If this works, we might have a prefix issue
      if (prefixCheckResult.status < 400) {
        diagnostics.apiPrefixIssues = true;
        diagnostics.problems.push({
          type: 'api_prefix',
          description: 'Possible API prefix duplication issue detected.',
          severity: 'medium'
        });
        diagnostics.recommendations.push('Check how API paths are constructed in frontend code.');
      }
    } catch (error) {
      // Expected to fail, this is normal
      console.log('✅ API prefix check completed.');
    }

    return diagnostics;
  } catch (error) {
    console.error('Error running diagnostics:', error);
    return {
      ...diagnostics,
      problems: [
        ...diagnostics.problems,
        {
          type: 'diagnostic_error',
          description: 'Error running diagnostics.',
          severity: 'medium'
        }
      ],
      recommendations: [
        ...diagnostics.recommendations,
        'Check browser console for more details.'
      ]
    };
  }
};

export default { runAuthDiagnostics };