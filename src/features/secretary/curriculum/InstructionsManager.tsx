import { useState } from 'react';
import { Card, SearchBar, ExportButtons, Modal } from '@/components/ui';
import { Plus, BookOpen, GraduationCap } from 'lucide-react';
import { CurriculumList } from './CurriculumList';
import { SubjectsList } from './SubjectsList';
import { CurriculumForm } from './CurriculumForm';
import { SubjectForm } from './SubjectForm';
import instructionsService from '@/services/api/instructionsService';

type ViewMode = 'curriculum' | 'subjects';

interface InstructionsManagerProps {
  variant?: 'admin' | 'chair' | 'secretary';
  readOnly?: boolean;
}

export function InstructionsManager({ variant = 'admin', readOnly = false }: InstructionsManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('curriculum');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateCurriculumModalOpen, setIsCreateCurriculumModalOpen] = useState(false);
  const [isCreateSubjectModalOpen, setIsCreateSubjectModalOpen] = useState(false);

  const handleExportPDF = async () => {
    try {
      const blob = await instructionsService.exportToPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instructions_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await instructionsService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instructions_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export Excel');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Instructions Management</h2>
          <p className="text-gray-600 mt-1">
            {readOnly 
              ? 'View curriculum, subjects, and course catalog' 
              : 'Manage curriculum, subjects, and course catalog'}
          </p>
          {readOnly && (
            <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
              <span className="font-medium">View Only:</span> You can view but not modify curriculum data
            </p>
          )}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-3">
            {viewMode === 'curriculum' && (
              <button
                onClick={() => setIsCreateCurriculumModalOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Curriculum
              </button>
            )}
            {viewMode === 'subjects' && (
              <button
                onClick={() => setIsCreateSubjectModalOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Subject
              </button>
            )}
          </div>
        )}
      </div>

      {/* View Mode Tabs */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('curriculum')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                viewMode === 'curriculum'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Curriculum
            </button>
            <button
              onClick={() => setViewMode('subjects')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                viewMode === 'subjects'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Subjects
            </button>
          </div>

          <div className="flex items-center gap-4">
            <SearchBar
              placeholder={`Search ${viewMode}...`}
              onChange={setSearchQuery}
              value={searchQuery}
              className="w-full sm:max-w-md"
            />
            <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
          </div>
        </div>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'curriculum' && (
        <CurriculumList searchQuery={searchQuery} readOnly={readOnly} />
      )}

      {viewMode === 'subjects' && (
        <SubjectsList searchQuery={searchQuery} readOnly={readOnly} />
      )}

      {/* Create Curriculum Modal - Only show if not read-only */}
      {!readOnly && (
        <>
          <Modal
            isOpen={isCreateCurriculumModalOpen}
            onClose={() => setIsCreateCurriculumModalOpen(false)}
            title="Create New Curriculum"
            size="xl"
          >
            <CurriculumForm
              onSubmit={() => {
                setIsCreateCurriculumModalOpen(false);
                // Refresh data
              }}
              onCancel={() => setIsCreateCurriculumModalOpen(false)}
            />
          </Modal>

          {/* Create Subject Modal */}
          <Modal
            isOpen={isCreateSubjectModalOpen}
            onClose={() => setIsCreateSubjectModalOpen(false)}
            title="Create New Subject"
            size="xl"
          >
            <SubjectForm
              onSubmit={() => {
                setIsCreateSubjectModalOpen(false);
                // Refresh data
              }}
              onCancel={() => setIsCreateSubjectModalOpen(false)}
            />
          </Modal>
        </>
      )}
    </div>
  );
}