// Direct implementation of validation functions for admissions

// Define interfaces for validation
export interface AdmissionData {
  studentName: string;
  dateOfBirth: string;
  gradeApplying: string;
  parentName: string;
  contactNumber: string;
  email: string;
  address: string;
  [key: string]: any; // Allow for additional properties
}

export interface ValidationErrors {
  [key: string]: string;
}

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-]{10,}$/,
  name: /^[a-zA-Z\s-']{2,}$/,
};

// Common validation functions
export const isValidEmail = (email: string): boolean => patterns.email.test(email);
export const isValidPhone = (phone: string): boolean => patterns.phone.test(phone);
export const isValidName = (name: string): boolean => patterns.name.test(name);
export const isValidDate = (date: string): boolean => !isNaN(Date.parse(date));

// Admission validation function
export const validateAdmission = (admission: AdmissionData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
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