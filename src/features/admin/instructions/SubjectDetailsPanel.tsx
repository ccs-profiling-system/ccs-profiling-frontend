import { useState, useEffect } from 'react';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Modal, Spinner, ErrorAlert } from '@/components/ui';
import { 
  Book, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  Eye, 
  FileCheck,
  Plus,
  BookOpen,
  Target,
  PlayCircle,
  Download,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { SyllabusUploadForm } from './SyllabusUploadForm';
import { LessonUploadForm } from './LessonUploadForm';
import instructionsService from '@/services/api/instructionsService';
import type { Subject, Syllabus, Lesson } from '@/types/instructions';

interface SubjectDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
  curriculumCode?: string;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
}

export function SubjectDetailsPanel({
  isOpen,
  onClose,
  subject,
  curriculumCode,
  onEdit,
  onDelete,
}: SubjectDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'lessons'>('overview');
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [isSyllabusFormOpen, setIsSyllabusFormOpen] = useState(false);
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (subject && isOpen) {
      fetchSubjectDetails();
    }
  }, [subject, isOpen]);

  const fetchSubjectDetails = async () => {
    if (!subject) return;

    try {
      setLoading(true);
      setError(null);

      const [syllabusData, lessonsData] = await Promise.all([
        instructionsService.getSyllabus(subject.id).catch(() => null),
        instructionsService.getLessons(subject.id).catch(() => [])
      ]);

      setSyllabus(syllabusData);
      setLessons(lessonsData);
    } catch (err) {
      setError('Failed to load subject details');
      console.error('Error fetching subject details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSyllabus = () => {
    setIsSyllabusFormOpen(true);
  };

  const handleEditSyllabus = () => {
    setIsSyllabusFormOpen(true);
  };

  const handleCreateLesson = () => {
    setSelectedLesson(null);
    setIsLessonFormOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsLessonFormOpen(true);
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!confirm(`Are you sure you want to delete "${lesson.title}"?`)) return;

    try {
      await instructionsService.deleteLesson(lesson.id);
      setLessons(lessons.filter(l => l.id !== lesson.id));
      alert('Lesson deleted successfully!');
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('Failed to delete lesson');
    }
  };

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
      case 'general_education':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800';
      case 'laboratory':
        return 'bg-green-100 text-green-800';
      case 'discussion':
        return 'bg-purple-100 text-purple-800';
      case 'examination':
        return 'bg-red-100 text-red-800';
      case 'project':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!subject) return null;

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
                <Book className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{subject.name}</h3>
                <p className="text-primary font-mono font-semibold text-lg">{subject.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(subject.type)}`}>
                {subject.type.replace('_', ' ').toUpperCase()}
              </span>
              <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {subject.units} {subject.units === 1 ? 'Unit' : 'Units'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Semester:</span> {subject.semester}
            </div>
            <div>
              <span className="font-semibold">Year Level:</span> {subject.yearLevel}
            </div>
            <div>
              <span className="font-semibold">Hours:</span> {subject.hours?.lecture || 0}L + {subject.hours?.laboratory || 0}Lab
            </div>
            {curriculumCode && (
              <div>
                <span className="font-semibold">Curriculum:</span> {curriculumCode}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'syllabus'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Syllabus
                {syllabus && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lessons'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Lessons
                {lessons.length > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    {lessons.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {loading && (
          <div className="flex items-center justify-center h-32">
            <Spinner size="lg" />
          </div>
        )}

        {error && <ErrorAlert message={error} />}

        {!loading && !error && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
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
                {((subject.prerequisites && subject.prerequisites.length > 0) || 
                  (subject.corequisites && subject.corequisites.length > 0)) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {subject.prerequisites && subject.prerequisites.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          Prerequisites
                        </h4>
                        <div className="space-y-2">
                          {subject.prerequisites.map((prereq, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                              <span className="text-sm text-gray-700 font-mono">{prereq}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {subject.corequisites && subject.corequisites.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          Corequisites
                        </h4>
                        <div className="space-y-2">
                          {subject.corequisites.map((coreq, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Learning Objectives
                    </h4>
                    <ul className="space-y-3">
                      {subject.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
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
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      Topics Covered
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {subject.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Syllabus Tab */}
            {activeTab === 'syllabus' && (
              <div className="space-y-6">
                {!syllabus ? (
                  <div className="text-center py-12">
                    <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Syllabus Created</h3>
                    <p className="text-gray-600 mb-6">Create a comprehensive syllabus for this subject</p>
                    <button
                      onClick={handleCreateSyllabus}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Create Syllabus
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Syllabus Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{syllabus.title}</h3>
                      <button
                        onClick={handleEditSyllabus}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Syllabus
                      </button>
                    </div>

                    {syllabus.description && (
                      <p className="text-gray-600">{syllabus.description}</p>
                    )}

                    {/* Syllabus Content */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      {syllabus.contentType === 'file' && syllabus.fileUrl ? (
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{syllabus.fileName || 'Syllabus File'}</p>
                              {syllabus.fileSize && (
                                <p className="text-sm text-gray-600">
                                  {(syllabus.fileSize / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Uploaded {new Date(syllabus.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={syllabus.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </div>
                      ) : syllabus.contentType === 'link' && syllabus.externalLink ? (
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <LinkIcon className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">External Link</p>
                              <p className="text-sm text-gray-600 truncate max-w-md">
                                {syllabus.externalLink}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Added {new Date(syllabus.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={syllabus.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open Link
                          </a>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No content available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Course Lessons ({lessons.length})
                  </h3>
                  <button
                    onClick={handleCreateLesson}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Lesson
                  </button>
                </div>

                {lessons.length === 0 ? (
                  <div className="text-center py-12">
                    <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Lessons Created</h3>
                    <p className="text-gray-600 mb-6">Start building your course by adding lessons</p>
                    <button
                      onClick={handleCreateLesson}
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      Add First Lesson
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                              {lesson.week}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLessonTypeColor(lesson.type)}`}>
                                  {lesson.type.toUpperCase()}
                                </span>
                              </div>
                              
                              {lesson.description && (
                                <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                              )}

                              {/* Lesson Content */}
                              {lesson.contentType === 'file' && lesson.fileUrl ? (
                                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">{lesson.fileName || 'Lesson File'}</p>
                                    {lesson.fileSize && (
                                      <p className="text-xs text-gray-600">
                                        {(lesson.fileSize / (1024 * 1024)).toFixed(2)} MB
                                      </p>
                                    )}
                                  </div>
                                  <a
                                    href={lesson.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-xs flex items-center gap-1 flex-shrink-0"
                                  >
                                    <Download className="w-3 h-3" />
                                    Download
                                  </a>
                                </div>
                              ) : lesson.contentType === 'link' && lesson.externalLink ? (
                                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <LinkIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm">External Link</p>
                                    <p className="text-xs text-gray-600 truncate">{lesson.externalLink}</p>
                                  </div>
                                  <a
                                    href={lesson.externalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded text-xs flex items-center gap-1 flex-shrink-0"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Open
                                  </a>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => handleEditLesson(lesson)}
                              className="p-2 hover:bg-primary/10 rounded-lg transition"
                              title="Edit Lesson"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson)}
                              className="p-2 hover:bg-red-100 rounded-lg transition"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {onEdit && (
              <button 
                onClick={() => onEdit(subject)}
                className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit Subject
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(subject)}
                className="px-4 py-3 border border-red-600 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-2 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Syllabus Form Modal */}
      <Modal
        isOpen={isSyllabusFormOpen}
        onClose={() => setIsSyllabusFormOpen(false)}
        title={syllabus ? 'Edit Syllabus' : 'Upload Syllabus'}
        size="lg"
      >
        <SyllabusUploadForm
          subject={subject}
          syllabus={syllabus}
          onSubmit={(newSyllabus: Syllabus) => {
            setSyllabus(newSyllabus);
            setIsSyllabusFormOpen(false);
          }}
          onCancel={() => setIsSyllabusFormOpen(false)}
        />
      </Modal>

      {/* Lesson Form Modal */}
      <Modal
        isOpen={isLessonFormOpen}
        onClose={() => {
          setIsLessonFormOpen(false);
          setSelectedLesson(null);
        }}
        title={selectedLesson ? 'Edit Lesson' : 'Upload Lesson'}
        size="lg"
      >
        <LessonUploadForm
          subject={subject}
          lesson={selectedLesson}
          onSubmit={(newLesson: Lesson) => {
            if (selectedLesson) {
              setLessons(lessons.map(l => l.id === newLesson.id ? newLesson : l));
            } else {
              setLessons([...lessons, newLesson].sort((a, b) => a.week - b.week));
            }
            setIsLessonFormOpen(false);
            setSelectedLesson(null);
          }}
          onCancel={() => {
            setIsLessonFormOpen(false);
            setSelectedLesson(null);
          }}
        />
      </Modal>
    </SlidePanel>
  );
}
