// Direct ES module implementation of course validation functions

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-]{10,}$/,
  name: /^[a-zA-Z\s-']{2,}$/,
};

// Common validation functions
export const isValidEmail = (email) => patterns.email.test(email);
export const isValidPhone = (phone) => patterns.phone.test(phone);
export const isValidName = (name) => patterns.name.test(name);
export const isPositiveNumber = (value) => !isNaN(value) && value > 0;

// Course validation function
export const validateCourse = (course) => {
  const errors = {};
  
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