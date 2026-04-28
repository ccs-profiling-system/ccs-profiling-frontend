import { useState } from 'react';
import { Card, SearchBar, ExportButtons } from '@/components/ui';
import { BookOpen, GraduationCap } from 'lucide-react';
import { CurriculumList } from './CurriculumList';
import { SubjectsList } from './SubjectsList';
import chairCurriculumService from '@/services/api/chair/chairCurriculumService';

type ViewMode = 'curriculum' | 'subjects';

/**
 * InstructionsViewer - View-only version for Chair Portal
 * 
 * This component allows chairs to view curriculum and subjects
 * without the ability to create, edit, or delete them.
 * Uses chair-specific API endpoints that are scoped to the chair's department.
 */
export function InstructionsViewer() {
  const [viewMode, setViewMode] = useState<ViewMode>('curriculum');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExportPDF = async () => {
    try {
      const blob = await chairCurriculumService.exportToPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `curriculum_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await chairCurriculumService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `curriculum_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export Excel. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Instructions</h2>
          <p className="text-gray-600 mt-1">View curriculum, subjects, and course catalog</p>
        </div>
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

      {/* Content based on view mode - View-only mode */}
      {viewMode === 'curriculum' && (
        <CurriculumList searchQuery={searchQuery} viewOnly={true} useChairService={true} />
      )}

      {viewMode === 'subjects' && (
        <SubjectsList searchQuery={searchQuery} viewOnly={true} useChairService={true} />
      )}
    </div>
  );
}
