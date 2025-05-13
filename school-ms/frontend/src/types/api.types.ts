import { AxiosResponse } from 'axios';

// Define the API response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
}

// Helper to indicate that courseService.getAll() returns AxiosResponse<Course[]>
// This helps TypeScript understand the return type includes .data property
export type CourseResponse = AxiosResponse<Course[]>;
export type StudentResponse = AxiosResponse<Student[]>;
export type TeacherResponse = AxiosResponse<Teacher[]>;

// Import or redefine the core types for clarity
export interface Course {
  id?: number;
  name: string;
  department: string;
  teacherId: number;
  credits: number;
  capacity: number;
  enrolled: number;
}

export interface Student {
  id?: number;
  studentId: string;
  name: string;
  grade: string;
  section?: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  status?: string;
  // Other student properties
}

export interface Teacher {
  id?: number;
  name: string;
  subject: string;
  email: string;
  phoneNumber: string;
  department: string;
  employeeId: string;
  subjects: string[];
  qualifications: string[];
  dateOfBirth: string;
  gender: string;
  address: string;
  joiningDate: string;
  status: string;
}
