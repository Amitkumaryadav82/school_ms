import dayjs, { Dayjs } from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';
import utc from 'dayjs/plugin/utc';

// Initialize dayjs plugins
dayjs.extend(localizedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(weekday);
dayjs.extend(utc);

/**
 * Converts a date object or string to a Dayjs object
 */
export const toDayjs = (date: Date | string | Dayjs | null | undefined): Dayjs | null => {
  if (!date) return null;
  if (dayjs.isDayjs(date)) return date;
  return dayjs(date);
};

/**
 * Format a date to a string representation
 */
export const formatDate = (date: Date | string | Dayjs | null | undefined, format = 'YYYY-MM-DD'): string => {
  const dayjsDate = toDayjs(date);
  if (!dayjsDate) return '';
  return dayjsDate.format(format);
};

/**
 * Get the first day of the month for a given date
 */
export const getFirstDayOfMonth = (date: Date | string | Dayjs): Dayjs => {
  return toDayjs(date)!.startOf('month');
};

/**
 * Get the last day of the month for a given date
 */
export const getLastDayOfMonth = (date: Date | string | Dayjs): Dayjs => {
  return toDayjs(date)!.endOf('month');
};

/**
 * Get the first day of the week for a given date
 */
export const getFirstDayOfWeek = (date: Date | string | Dayjs): Dayjs => {
  return toDayjs(date)!.startOf('week');
};

/**
 * Get the last day of the week for a given date
 */
export const getLastDayOfWeek = (date: Date | string | Dayjs): Dayjs => {
  return toDayjs(date)!.endOf('week');
};

/**
 * Convert a Date object to Dayjs safely
 * This is useful for MUI date pickers that return Date objects
 */
export const convertDatePickerValue = (value: any): Dayjs | null => {
  if (!value) return null;
  return dayjs(value);
};

/**
 * Helper function for MUI DatePicker onChange handlers
 * Use this to safely set state from MUI DatePicker components
 */
export const handleDatePickerChange = (
  date: any, 
  setDateFunction: (date: Dayjs | null) => void
): void => {
  if (date === null) {
    setDateFunction(null);
    return;
  }
  
  setDateFunction(convertDatePickerValue(date));
};

export default {
  toDayjs,
  formatDate,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getFirstDayOfWeek,
  getLastDayOfWeek,
  convertDatePickerValue,
  handleDatePickerChange
};
