import { jsx as _jsx } from "react/jsx-runtime";
import { StudentProfile } from '@/features/admin/students/StudentProfile';
export function SecretaryStudentProfileWrapper({ student, onClose, onEdit, onDelete, onSkillAdded, }) {
    // Use the admin StudentProfile component directly
    // It already has all the tabs including document management capabilities
    return (_jsx(StudentProfile, { student: student, onClose: onClose, onEdit: onEdit, onDelete: onDelete, onSkillAdded: onSkillAdded }));
}
