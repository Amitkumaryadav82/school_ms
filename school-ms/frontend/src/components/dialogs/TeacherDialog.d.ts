import { Teacher } from '../../services/teacherService';
import React from 'react';
interface TeacherDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (teacher: Teacher) => Promise<void>;
    teacher?: Teacher;
    mode: 'add' | 'edit';
}
declare const TeacherDialog: ({ open, onClose, onSave, teacher, mode }: TeacherDialogProps) => React.JSX.Element;
export default TeacherDialog;
