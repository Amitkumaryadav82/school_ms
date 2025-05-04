import { Student } from '../services/studentService';
import { Teacher } from '../services/teacherService';
import { Course } from '../services/courseService';
import { AdmissionApplication } from '../services/admissionService';
import { LeaveRequest } from '../services/leaveService';
import { Message } from '../services/messageService';
import { Fee, Payment } from '../services/feeService';
import { Exam, ExamResult } from '../services/examService';
import { Attendance } from '../services/attendanceService';

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-]{10,}$/,
  name: /^[a-zA-Z\s-']{2,}$/,
  studentId: /^[A-Z0-9]{8,}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  indianMobile: /^\+91\d{10}$/, // Indian mobile number pattern: +91 followed by 10 digits
};

// Common validation functions
export const isValidEmail = (email: string): boolean => patterns.email.test(email);
export const isValidPhone = (phone: string): boolean => patterns.phone.test(phone);
export const isValidName = (name: string): boolean => patterns.name.test(name);
export const isValidStudentId = (id: string): boolean => patterns.studentId.test(id);
export const isPositiveNumber = (value: number): boolean => !isNaN(value) && value > 0;
export const isValidDate = (date: string): boolean => !isNaN(Date.parse(date));
export const isValidPassword = (password: string): boolean => patterns.password.test(password);

// Student validation
export const validateStudent = (student: Student) => {
  const errors: Record<string, string> = {};

  if (!student.name || !isValidName(student.name)) {
    errors.name = 'Please enter a valid name (minimum 2 characters, letters only)';
  }
  if (!student.grade) {
    errors.grade = 'Grade is required';
  }
  if (!student.email || !isValidEmail(student.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!student.phoneNumber || !isValidPhone(student.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid phone number';
  }
  if (student.studentId && !isValidStudentId(student.studentId)) {
    errors.studentId = 'Please enter a valid student ID';
  }
  
  // New validations
  // Date of Birth validation - must be present and equal to current date
  if (!student.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  }
  
  // Address validation - must be present
  if (!student.address || student.address.trim() === '') {
    errors.address = 'Address is required';
  }
  
  // Guardian Name validation - must be present
  if (!student.parentName || student.parentName.trim() === '') {
    errors.parentName = 'Guardian name is required';
  }
  
  // Guardian Contact validation - must be present, start with +91, and be exactly 10 digits after +91
  if (!student.parentContact) {
    errors.parentContact = 'Guardian contact is required';
  } else if (!patterns.indianMobile.test(student.parentContact)) {
    errors.parentContact = 'Guardian contact must start with +91 followed by 10 digits';
  }

  return errors;
};

// Teacher validation
export const validateTeacher = (teacher: Teacher) => {
  const errors: Record<string, string> = {};

  if (!teacher.name || !isValidName(teacher.name)) {
    errors.name = 'Please enter a valid name (minimum 2 characters, letters only)';
  }
  if (!teacher.subject) {
    errors.subject = 'Subject is required';
  }
  if (!teacher.department) {
    errors.department = 'Department is required';
  }
  if (!teacher.email || !isValidEmail(teacher.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!teacher.phoneNumber || !isValidPhone(teacher.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid phone number';
  }

  return errors;
};

// Course validation
export const validateCourse = (course: Course) => {
  const errors: Record<string, string> = {};

  if (!course.name || course.name.length < 3) {
    errors.name = 'Course name must be at least 3 characters';
  }
  if (!course.department) {
    errors.department = 'Department is required';
  }
  if (!course.teacher) {
    errors.teacher = 'Teacher is required';
  }
  if (!isPositiveNumber(course.credits)) {
    errors.credits = 'Credits must be a positive number';
  }
  if (!isPositiveNumber(course.capacity)) {
    errors.capacity = 'Capacity must be a positive number';
  }
  if (course.enrolled > course.capacity) {
    errors.enrolled = 'Enrolled students cannot exceed capacity';
  }

  return errors;
};

// Admission validation
export const validateAdmission = (admission: AdmissionApplication) => {
  const errors: Record<string, string> = {};

  if (!admission.studentName || !isValidName(admission.studentName)) {
    errors.studentName = 'Please enter a valid student name';
  }
  if (!admission.dateOfBirth || !isValidDate(admission.dateOfBirth)) {
    errors.dateOfBirth = 'Please enter a valid date of birth';
  }
  if (!admission.gradeApplying) {
    errors.gradeApplying = 'Grade is required';
  }
  if (!admission.parentName || !isValidName(admission.parentName)) {
    errors.parentName = 'Please enter a valid parent/guardian name';
  }
  if (!admission.contactNumber || !isValidPhone(admission.contactNumber)) {
    errors.contactNumber = 'Please enter a valid phone number';
  }
  if (!admission.email || !isValidEmail(admission.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!admission.address || admission.address.length < 10) {
    errors.address = 'Please enter a complete address (minimum 10 characters)';
  }

  return errors;
};

// Leave request validation
export const validateLeaveRequest = (leave: LeaveRequest) => {
  const errors: Record<string, string> = {};

  if (!leave.startDate || !isValidDate(leave.startDate)) {
    errors.startDate = 'Please enter a valid start date';
  }
  if (!leave.endDate || !isValidDate(leave.endDate)) {
    errors.endDate = 'Please enter a valid end date';
  }
  if (new Date(leave.endDate) < new Date(leave.startDate)) {
    errors.endDate = 'End date must be after start date';
  }
  if (!leave.reason || leave.reason.length < 10) {
    errors.reason = 'Please provide a detailed reason (minimum 10 characters)';
  }
  if (!leave.type) {
    errors.type = 'Leave type is required';
  }

  return errors;
};

// Message validation
export const validateMessage = (message: Message) => {
  const errors: Record<string, string> = {};

  if (!message.subject || message.subject.length < 3) {
    errors.subject = 'Subject must be at least 3 characters';
  }
  if (!message.content || message.content.length < 10) {
    errors.content = 'Message content must be at least 10 characters';
  }
  if (!message.recipient) {
    errors.recipient = 'Recipient is required';
  }
  if (!message.type) {
    errors.type = 'Message type is required';
  }

  return errors;
};

// Fee validation
export const validateFee = (fee: Fee) => {
  const errors: Record<string, string> = {};

  if (!fee.grade) {
    errors.grade = 'Grade is required';
  }
  if (!fee.type) {
    errors.type = 'Fee type is required';
  }
  if (!isPositiveNumber(fee.amount)) {
    errors.amount = 'Amount must be a positive number';
  }
  if (!fee.dueDate || !isValidDate(fee.dueDate)) {
    errors.dueDate = 'Please enter a valid due date';
  }

  return errors;
};

// Payment validation
export const validatePayment = (payment: Payment) => {
  const errors: Record<string, string> = {};

  if (!payment.studentId) {
    errors.studentId = 'Student ID is required';
  }
  if (!isPositiveNumber(payment.amount)) {
    errors.amount = 'Amount must be a positive number';
  }
  if (!payment.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  }

  return errors;
};

// Exam validation
export const validateExam = (exam: Exam) => {
  const errors: Record<string, string> = {};

  if (!exam.name || exam.name.length < 3) {
    errors.name = 'Exam name must be at least 3 characters';
  }
  if (!exam.subject) {
    errors.subject = 'Subject is required';
  }
  if (!exam.grade) {
    errors.grade = 'Grade is required';
  }
  if (!exam.date || !isValidDate(exam.date)) {
    errors.date = 'Please enter a valid exam date';
  }
  if (!isPositiveNumber(exam.duration)) {
    errors.duration = 'Duration must be a positive number';
  }
  if (!isPositiveNumber(exam.maxMarks)) {
    errors.maxMarks = 'Maximum marks must be a positive number';
  }
  if (!isPositiveNumber(exam.passingMarks)) {
    errors.passingMarks = 'Passing marks must be a positive number';
  }
  if (exam.passingMarks > exam.maxMarks) {
    errors.passingMarks = 'Passing marks cannot exceed maximum marks';
  }

  return errors;
};

// Exam result validation
export const validateExamResult = (result: ExamResult) => {
  const errors: Record<string, string> = {};

  if (!result.studentId) {
    errors.studentId = 'Student ID is required';
  }
  if (!isPositiveNumber(result.marksObtained)) {
    errors.marksObtained = 'Marks obtained must be a positive number';
  }

  return errors;
};

// Attendance validation
export const validateAttendance = (attendance: Attendance) => {
  const errors: Record<string, string> = {};

  if (!attendance.studentId) {
    errors.studentId = 'Student ID is required';
  }
  if (!attendance.date || !isValidDate(attendance.date)) {
    errors.date = 'Please enter a valid date';
  }
  if (!attendance.status) {
    errors.status = 'Attendance status is required';
  }

  return errors;
};