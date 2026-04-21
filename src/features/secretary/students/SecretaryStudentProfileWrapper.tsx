import { useState } from 'react';
import { StudentProfile } from '@/features/admin/students/StudentProfile';
import type { Student } from '@/types/students';

interface SecretaryStudentProfileWrapperProps {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSkillAdded?: () => void;
}

export function SecretaryStudentProfileWrapper({
  student,
  onClose,
  onEdit,
  onDelete,
  onSkillAdded,
}: SecretaryStudentProfileWrapperProps) {
  // Use the admin StudentProfile component directly
  // It already has all the tabs including document management capabilities
  return (
    <StudentProfile
      student={student}
      onClose={onClose}
      onEdit={onEdit}
      onDelete={onDelete}
      onSkillAdded={onSkillAdded}
    />
  );
}
