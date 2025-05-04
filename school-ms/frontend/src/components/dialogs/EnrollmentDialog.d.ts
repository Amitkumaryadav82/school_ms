import { Student } from '../../services/studentService';
import { Course } from '../../services/courseService';
import React from 'react';
interface EnrollmentDialogProps {
    open: boolean;
    onClose: () => void;
    onEnroll: (studentId: number, courseId: number) => Promise<void>;
    onUnenroll: (studentId: number, courseId: number) => Promise<void>;
    course?: Course;
    enrolledStudents: Student[];
    availableStudents: Student[];
}
declare const EnrollmentDialog: ({ open, onClose, onEnroll, onUnenroll, course, enrolledStudents, availableStudents, }: EnrollmentDialogProps) => React.JSX.Element;
export default EnrollmentDialog;
