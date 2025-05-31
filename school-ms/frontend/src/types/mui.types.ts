/**
 * Custom types to fix compatibility issues in MUI components
 */

import { ReactElement } from 'react';
import { Dayjs } from 'dayjs';

/**
 * Type for compatible icon props in MUI Chip components 
 */
export interface ChipIconProps {
  icon?: ReactElement | undefined;
  deleteIcon?: ReactElement | undefined;
}

/**
 * Type for compatible date props in MUI DatePicker
 */
export interface DatePickerProps {
  value: Date | null | Dayjs;
  onChange: (date: Date | null | Dayjs | any) => void;
  inputFormat?: string;
  renderInput?: (params: any) => JSX.Element;
  slotProps?: any;
  label?: string;
  views?: string[];
}

/**
 * Type for API response objects that may have optional fields
 */
export interface ApiResponseObject<T = any> {
  data?: T;
  message?: string;
  status?: number;
  error?: string | Error;
}

/**
 * Type for API endpoint function options with flexible dependencies
 */
export interface ApiOptions<T = any> {
  dependencies?: Array<any> | number | string | boolean | object;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Type for DatePicker change event handler
 */
export type DatePickerChangeHandler = (date: any, context?: any) => void;

/**
 * Type for safely handling TextField value changes
 */
export type TextFieldChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;

/**
 * Type for form control components with error handling
 */
export interface FormControlProps {
  fullWidth?: boolean;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
}
