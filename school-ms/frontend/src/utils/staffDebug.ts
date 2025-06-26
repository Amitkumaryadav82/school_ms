/**
 * Debug utilities specifically for staff-related data troubleshooting
 */

/**
 * Inspects an object in detail, showing its structure
 */
export const inspectObject = (obj: any, label: string = 'Object Inspection'): void => {
  console.group(label);
  
  if (obj === null) {
    console.log('Object is null');
    console.groupEnd();
    return;
  }
  
  if (obj === undefined) {
    console.log('Object is undefined');
    console.groupEnd();
    return;
  }
  
  // Log type information
  console.log('Type:', typeof obj);
  console.log('Is Array:', Array.isArray(obj));
  
  // Log properties
  if (typeof obj === 'object') {
    console.log('Keys:', Object.keys(obj));
    console.log('Has prototype:', Object.getPrototypeOf(obj) !== null);
    
    // If it's an array, log length and first few items
    if (Array.isArray(obj)) {
      console.log('Array length:', obj.length);
      console.log('First 3 items:', obj.slice(0, 3));
      
      // If array has items, inspect first item
      if (obj.length > 0) {
        console.log('First item type:', typeof obj[0]);
        console.log('First item keys:', typeof obj[0] === 'object' ? Object.keys(obj[0]) : 'Not an object');
      }
    } else {
      // Regular object
      const sampleProps: Record<string, any> = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        sampleProps[key] = {
          type: typeof value,
          isNull: value === null,
          isUndefined: value === undefined,
          isArray: Array.isArray(value),
          sample: typeof value === 'object' ? (Array.isArray(value) ? `Array[${value.length}]` : 'Object') : value
        };
      });
      
      console.log('Properties:', sampleProps);
    }
  }
  
  console.groupEnd();
};

/**
 * Debug utility to create a fallback staff member for testing purposes
 */
export const createTestStaffMember = () => {
  return {
    id: 9999,
    staffId: "TEST-001",
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    role: "ADMIN",
    isActive: true,
    employmentStatus: "ACTIVE",
    department: "IT"
  };
};

/**
 * Debug the staff API response
 */
export const debugStaffResponse = (response: any) => {
  console.group('Staff API Response Debug');
  
  inspectObject(response, 'Response Overview');
  
  // Check for common issues
  if (Array.isArray(response)) {
    console.log('Response is an array with', response.length, 'items');
    
    if (response.length === 0) {
      console.warn('API returned an empty array');
    } else {
      console.log('First item sample:');
      inspectObject(response[0], 'First Item');
    }
  } else if (typeof response === 'object' && response !== null) {
    console.log('Response is a single object');
    
    // Check for error patterns
    if (response.error || response.message || response.status) {
      console.warn('Object may be an error response:', {
        hasError: 'error' in response,
        hasMessage: 'message' in response,
        hasStatus: 'status' in response
      });
    }
  } else {
    console.warn('Response is not an object or array:', typeof response);
  }
  
  console.groupEnd();
};
