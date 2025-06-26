import { config } from '../config/environment';
import { StaffMember } from '../types/staff';

// Enhanced diagnostic version to handle malformed JSON

export const staffServiceDiag = {
  // Get all staff members with enhanced error handling
  getAll: async (): Promise<StaffMember[]> => {
    try {
      console.log('Diagnostic: Fetching staff data from API');
      
      // Use a direct fetch call to have more control over error handling
      const fullUrl = `${config.apiUrl}/api/staff`;
      console.log('Diagnostic: Full URL:', fullUrl);
      
      const authToken = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      // Using fetch directly to better handle JSON parsing errors
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      // Get raw text first to handle potential JSON parsing errors
      const rawText = await response.text();
      console.log('Diagnostic: Raw response length:', rawText.length);
      console.log('Diagnostic: Raw response first 100 chars:', rawText.substring(0, 100));
      
      // First try direct parsing
      try {
        const data = JSON.parse(rawText);
        console.log('Diagnostic: JSON parsed successfully:', {
          type: typeof data,
          isArray: Array.isArray(data),
          length: Array.isArray(data) ? data.length : 'N/A',
          keys: typeof data === 'object' && data !== null ? Object.keys(data) : 'N/A'
        });
        
        if (Array.isArray(data)) {
          return data;
        } else if (data && typeof data === 'object') {
          if ('data' in data && Array.isArray(data.data)) {
            return data.data;
          }
        }
        
        console.warn('Diagnostic: Unexpected data format:', data);
        return [];
      } catch (parseError: any) {
        console.error('Diagnostic: JSON parse error:', parseError.message);
        
        // Try to fix common JSON issues
        let cleanedText = rawText;
        
        // 1. Try to fix unquoted property names
        cleanedText = cleanedText.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
        
        // 2. Fix single quotes to double quotes
        cleanedText = cleanedText.replace(/'([^']*)'(\s*:)/g, '"$1"$2');
        cleanedText = cleanedText.replace(/:\s*'([^']*)'/g, ':"$1"');
        
        // 3. Remove trailing commas
        cleanedText = cleanedText.replace(/,(\s*[\]}])/g, '$1');
        
        // 4. Look for control characters
        const hasControlChars = /[\u0000-\u001F]/.test(cleanedText);
        if (hasControlChars) {
          console.log('Diagnostic: Control characters found, trying to remove them');
          cleanedText = cleanedText.replace(/[\u0000-\u001F]/g, '');
        }
        
        console.log('Diagnostic: Cleaned text (first 100 chars):', cleanedText.substring(0, 100));
        
        try {
          const data = JSON.parse(cleanedText);
          console.log('Diagnostic: Cleaned JSON parsed successfully!');
          
          if (Array.isArray(data)) {
            return data;
          } else if (data && typeof data === 'object') {
            if ('data' in data && Array.isArray(data.data)) {
              return data.data;
            }
          }
          
          return [];
        } catch (secondError: any) {
          console.error('Diagnostic: Still failed to parse after cleaning:', secondError.message);
          
          // Try to extract position information to better understand the issue
          const posMatch = parseError.message.match(/position (\d+)/);
          if (posMatch && posMatch[1]) {
            const errorPos = parseInt(posMatch[1], 10);
            console.log(`Diagnostic: Error at position ${errorPos}`);
            
            // Show text around error position
            const start = Math.max(0, errorPos - 30);
            const end = Math.min(rawText.length, errorPos + 30);
            console.log('Text around error:',
              JSON.stringify(rawText.substring(start, errorPos)) + ' 🔴 ' + 
              JSON.stringify(rawText.substring(errorPos, end)));
            
            // Try to extract array parts if they exist
            if (rawText.includes('[') && rawText.includes(']')) {
              const arrayStart = rawText.indexOf('[');
              const arrayEnd = rawText.lastIndexOf(']');
              
              if (arrayStart !== -1 && arrayEnd !== -1 && arrayStart < arrayEnd) {
                const arrayText = rawText.substring(arrayStart, arrayEnd + 1);
                console.log('Diagnostic: Attempting to parse array section directly');
                
                try {
                  const arrayData = JSON.parse(arrayText);
                  if (Array.isArray(arrayData)) {
                    console.log('Diagnostic: Successfully extracted array with', arrayData.length, 'items');
                    return arrayData;
                  }
                } catch (arrayError) {
                  console.error('Diagnostic: Failed to parse array section:', arrayError);
                }
              }
            }
          }
          
          // Last resort: try to analyze the raw response structure
          console.log('Diagnostic: Analyzing raw response structure...');
          
          // Check for multiple valid JSON objects (possible output from CORS debugging)
          const jsonObjects = rawText.match(/\{.*?\}/g);
          if (jsonObjects && jsonObjects.length > 0) {
            console.log(`Diagnostic: Found ${jsonObjects.length} potential JSON objects`);
            
            for (let i = 0; i < jsonObjects.length; i++) {
              try {
                const obj = JSON.parse(jsonObjects[i]);
                console.log(`Diagnostic: Object ${i} parsed successfully:`, obj);
                
                // If we find an array, return it
                if (Array.isArray(obj)) {
                  return obj;
                }
                
                // If we find an object with a data property that's an array, return it
                if (obj && typeof obj === 'object' && 'data' in obj && Array.isArray(obj.data)) {
                  return obj.data;
                }
              } catch (objError) {
                console.log(`Diagnostic: Object ${i} failed to parse`);
              }
            }
          }
          
          // Some servers return a list of JSON objects without wrapping them in an array
          // Try to convert series of JSON objects into an array
          if (rawText.trim().startsWith('{') && rawText.trim().endsWith('}')) {
            try {
              // Split by closing/opening braces and try to parse each segment
              const segments = rawText.split(/}\s*{/).map((segment, i) => {
                // Add back the braces except for first and last
                if (i === 0) return segment + '}';
                if (i === rawText.split(/}\s*{/).length - 1) return '{' + segment;
                return '{' + segment + '}';
              });
              
              console.log(`Diagnostic: Found ${segments.length} potential JSON segments`);
              
              const parsedObjects = [];
              for (const segment of segments) {
                try {
                  parsedObjects.push(JSON.parse(segment));
                } catch (segmentError) {
                  console.log('Diagnostic: Failed to parse segment:', segment.substring(0, 30));
                }
              }
              
              if (parsedObjects.length > 0) {
                console.log(`Diagnostic: Successfully parsed ${parsedObjects.length} objects from segments`);
                return parsedObjects;
              }
            } catch (splitError) {
              console.error('Diagnostic: Failed to split and parse objects:', splitError);
            }
          }
        }
        
        // If all else fails, at least show chunks of the response to help debugging
        console.log('Diagnostic: Raw response (first 500 chars):');
        console.log(rawText.substring(0, 500));
        if (rawText.length > 1000) {
          console.log('Diagnostic: Raw response (middle 500 chars):');
          const middle = Math.floor(rawText.length / 2);
          console.log(rawText.substring(middle - 250, middle + 250));
        }
        console.log('Diagnostic: Raw response (last 500 chars):');
        console.log(rawText.substring(Math.max(0, rawText.length - 500)));
        
        return [];
      }
    } catch (error: any) {
      console.error('Diagnostic: Error fetching staff data:', error.message);
      return [];
    }
  }
};
