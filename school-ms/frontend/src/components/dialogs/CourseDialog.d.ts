import { Course } from '../../services/courseService';
import React from 'react';
interface CourseDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (course: Course) => Promise<void>;
    course?: Course;
    mode: 'add' | 'edit';
}
declare const CourseDialog: ({ open, onClose, onSave, course, mode }: CourseDialogProps) => React.JSX.Element;
export default CourseDialog;
