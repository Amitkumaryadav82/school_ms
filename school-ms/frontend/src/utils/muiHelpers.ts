import React from 'react';
import { Dayjs } from 'dayjs';
import { toDayjs, convertDatePickerValue } from '../utils/dateUtils';

/**
 * Creates a properly typed onChange handler for MUI DatePicker components
 * that handles the conversion between MUI's DatePicker value types and dayjs
 * 
 * @param setDate The state setter function for the date
 * @returns A properly typed onChange handler for MUI DatePicker
 */
export function createDatePickerChangeHandler(
  setDate: (date: Dayjs | null) => void
) {
  return (value: any, context?: any) => {
    if (value === null) {
      setDate(null);
      return;
    }
    
    setDate(convertDatePickerValue(value));
  };
}

/**
 * Generates a status icon compatible with MUI Chip component
 * 
 * @param status The attendance status
 * @returns A React element for the icon or undefined
 */
export function getStatusIconForChip(status: string | undefined): React.ReactElement | undefined {
  // This needs to return a proper React element or undefined, not null
  if (!status) return undefined;
  
  // Implementation would depend on your actual component
  // This is just a placeholder to fix type issues
  return undefined;
}

/**
 * Helper type for UseApiOptions to support different dependency types
 */
export type UseApiDependencies = any[] | Record<string, any> | number | string | boolean;

/**
 * Create safe parameters for useApi hooks that properly handle different dependency types
 * 
 * @param dependencies The dependencies to pass to useApi
 * @returns An object with dependencies property
 */
export function createApiOptions(dependencies: UseApiDependencies) {
  return {
    dependencies: Array.isArray(dependencies) ? dependencies : [dependencies]
  };
}

export default {
  createDatePickerChangeHandler,
  getStatusIconForChip,
  createApiOptions
};
