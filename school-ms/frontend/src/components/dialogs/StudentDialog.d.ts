import { Student } from '../../services/studentService';
import React from 'react';
interface StudentDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (student: Student) => Promise<void>;
    student?: Student;
    mode: 'add' | 'edit';
}
declare const StudentDialog: ({ open, onClose, onSave, student, mode }: StudentDialogProps) => React.JSX.Element;
export default StudentDialog;
