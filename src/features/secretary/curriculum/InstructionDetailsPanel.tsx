import { SlidePanel } from '@/components/ui/SlidePanel';
import { useState } from 'react';
import {
  Book,
  Clock,
  Calendar,
  Award,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  Download,
  Eye,
  Upload,
  FileCheck
} from 'lucide-react';
import type { Instruction } from '@/services/api/instructionsService';

interface InstructionDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  instruction: Instruction | null;
  onEdit?: (instruction: Instruction) => void;
  onDelete?: (instruction: Instruction) => void;
}

export function InstructionDetailsPanel({
  isOpen,
  onClose,
  instruction,
  onEdit,
  onDelete,
}: InstructionDetailsPanelProps) {
  if (!instruction) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Instruction Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{instruction.subject_name}</h3>
                <p className="text-primary font-mono font-semibold text-lg">{instruction.subject_code}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {instruction.credits} {instruction.credits === 1 ? 'Credit' : 'Credits'}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">Curriculum Year:</span> {instruction.curriculum_year}
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs font-medium">Credits</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{instruction.credits}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Curriculum Year</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{instruction.curriculum_year}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-xs font-medium">Subject Code</span>
            </div>
            <p className="text-lg font-bold text-gray-900 font-mono">{instruction.subject_code}</p>
          </div>
        </div>

        {/* Description */}
        {instruction.description && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Description
            </h4>
            <p className="text-gray-700 leading-relaxed">{instruction.description}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Record Information
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Created Date</p>
              <p className="font-semibold text-gray-900">{formatDate(instruction.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Last Updated</p>
              <p className="font-semibold text-gray-900">{formatDate(instruction.updated_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Instruction ID</p>
              <p className="font-mono text-sm text-gray-700">{instruction.id}</p>
            </div>
            {instruction.deleted_at && (
              <div>
                <p className="text-xs text-red-600 mb-1">Deleted Date</p>
                <p className="font-semibold text-red-700">{formatDate(instruction.deleted_at)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for Future Features */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gray-600" />
            Additional Information
          </h4>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Prerequisites: Not configured yet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Learning Objectives: Not configured yet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Course Materials: Not configured yet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Class Schedules: Managed separately in Schedules module</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This instruction can be used to create class schedules in the Schedules module. 
              Additional features like prerequisites, learning objectives, and course materials may be added in future updates.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {onEdit && (
              <button 
                onClick={() => onEdit(instruction)}
                className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit Instruction
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(instruction)}
                className="px-4 py-3 border border-red-600 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-2 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </SlidePanel>
  );
}