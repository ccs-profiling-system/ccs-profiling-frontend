import { SlidePanel } from '@/components/ui/SlidePanel';
import { FileViewer } from '@/components/ui/FileViewer';
import { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  GraduationCap, 
  FileText, 
  Users,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  Eye,
  Upload,
  File
} from 'lucide-react';

interface Subject {
  id: number;
  code: string;
  name: string;
  units: number;
  semester: number;
  yearLevel: number;
  description?: string;
  prerequisites?: string[];
  corequisites?: string[];
  type?: 'core' | 'elective' | 'major' | 'minor';
  hours?: {
    lecture: number;
    laboratory: number;
  };
  objectives?: string[];
  topics?: string[];
  faculty?: string;
  schedule?: string;
  room?: string;
  enrolledStudents?: number;
  maxCapacity?: number;
  syllabus?: {
    fileName: string;
    fileUrl: string;
    uploadedDate: string;
    fileSize: string;
  };
}

interface SubjectDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  curriculumCode?: string;
}

export function SubjectDetailsPanel({ 
  isOpen, 
  onClose, 
  subject,
  curriculumCode 
}: SubjectDetailsPanelProps) {
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);

  if (!subject) return null;

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'core':
        return 'bg-blue-100 text-blue-800';
      case 'major':
        return 'bg-primary/10 text-primary';
      case 'elective':
        return 'bg-green-100 text-green-800';
      case 'minor':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const enrollmentPercentage = subject.enrolledStudents && subject.maxCapacity
    ? (subject.enrolledStudents / subject.maxCapacity) * 100
    : 0;

  const handleDownloadSyllabus = () => {
    if (subject.syllabus) {
      const link = document.createElement('a');
      link.href = subject.syllabus.fileUrl;
      link.download = subject.syllabus.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewSyllabus = () => {
    setIsFileViewerOpen(true);
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Subject Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{subject.name}</h3>
                <p className="text-primary font-mono font-semibold">{subject.code}</p>
              </div>
            </div>
            {subject.type && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(subject.type)}`}>
                {subject.type.toUpperCase()}
              </span>
            )}
          </div>
          
          {curriculumCode && (
            <p className="text-sm text-gray-600">
              Curriculum: <span className="font-semibold">{curriculumCode}</span>
            </p>
          )}
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Units</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{subject.units}</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Semester</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{subject.semester}</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span className="text-xs font-medium">Year Level</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{subject.yearLevel}</p>
          </div>

          {subject.hours && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Hours/Week</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Lec: {subject.hours.lecture} | Lab: {subject.hours.laboratory}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {subject.description && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Description
            </h4>
            <p className="text-gray-700 leading-relaxed">{subject.description}</p>
          </div>
        )}

        {/* Prerequisites & Corequisites */}
        {(subject.prerequisites || subject.corequisites) && (
          <div className="grid md:grid-cols-2 gap-4">
            {subject.prerequisites && subject.prerequisites.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-secondary" />
                  Prerequisites
                </h4>
                <div className="space-y-2">
                  {subject.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                      <span className="text-sm text-gray-700 font-mono">{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subject.corequisites && subject.corequisites.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Corequisites
                </h4>
                <div className="space-y-2">
                  {subject.corequisites.map((coreq, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span className="text-sm text-gray-700 font-mono">{coreq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Learning Objectives */}
        {subject.objectives && subject.objectives.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Learning Objectives
            </h4>
            <ul className="space-y-2">
              {subject.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 leading-relaxed">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Topics Covered */}
        {subject.topics && subject.topics.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Topics Covered
            </h4>
            <div className="flex flex-wrap gap-2">
              {subject.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Current Offering Info */}
        {(subject.faculty || subject.schedule || subject.room) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Current Offering
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {subject.faculty && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Faculty</p>
                  <p className="font-semibold text-gray-900">{subject.faculty}</p>
                </div>
              )}
              {subject.schedule && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Schedule</p>
                  <p className="font-semibold text-gray-900">{subject.schedule}</p>
                </div>
              )}
              {subject.room && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Room</p>
                  <p className="font-semibold text-gray-900">{subject.room}</p>
                </div>
              )}
            </div>

            {/* Enrollment Status */}
            {subject.enrolledStudents !== undefined && subject.maxCapacity && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">Enrollment</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {subject.enrolledStudents} / {subject.maxCapacity}
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      enrollmentPercentage >= 90
                        ? 'bg-secondary'
                        : enrollmentPercentage >= 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${enrollmentPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Syllabus Section */}
        {subject.syllabus ? (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Course Syllabus
            </h4>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <File className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{subject.syllabus.fileName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      <span>{subject.syllabus.fileSize}</span>
                      <span>•</span>
                      <span>Uploaded: {subject.syllabus.uploadedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={handleViewSyllabus}
                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition"
                    title="View Syllabus"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownloadSyllabus}
                    className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
                    title="Download Syllabus"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Course Syllabus
            </h4>
            <div className="text-center py-6">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-3">No syllabus uploaded yet</p>
              <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition text-sm">
                Upload Syllabus
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2 font-medium">
            <Edit className="w-4 h-4" />
            Edit Subject
          </button>
          <button className="px-4 py-3 border border-secondary text-secondary hover:bg-secondary/10 rounded-lg transition flex items-center justify-center gap-2 font-medium">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* File Viewer Modal */}
      {subject.syllabus && (
        <FileViewer
          isOpen={isFileViewerOpen}
          onClose={() => setIsFileViewerOpen(false)}
          fileUrl={subject.syllabus.fileUrl}
          fileName={subject.syllabus.fileName}
          fileType="Course Syllabus"
        />
      )}
    </SlidePanel>
  );
}
