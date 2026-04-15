import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import {
  BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp,
  GraduationCap, TrendingUp, FileText,
} from 'lucide-react';
import type { AcademicProgress, DegreeRequirement } from '../types';
import { studentService } from '@/services/api/studentService';
import { courseService } from '@/services/api/courseService';
import type { Course } from '../types';

export function AcademicRequirementsPage() {
  const [progress, setProgress] = useState<AcademicProgress | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prog, enrolled] = await Promise.all([
        studentService.getAcademicProgress(),
        courseService.getEnrolledCourses(),
      ]);
      setProgress(prog);
      setCourses(enrolled);
    } catch {
      setError('Failed to load academic requirements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <StudentLayout title="Academic Requirements"><LoadingState text="Loading requirements..." /></StudentLayout>;
  if (error) return <StudentLayout title="Academic Requirements"><ErrorState message={error} onRetry={load} /></StudentLayout>;
  if (!progress) return null;

  const categories = Array.from(new Set(progress.requirements.map(r => r.category)));
  const filtered = selectedCategory === 'all'
    ? progress.requirements
    : progress.requirements.filter(r => r.category === selectedCategory);

  const grouped = filtered.reduce((acc, req) => {
    if (!acc[req.category]) acc[req.category] = [];
    acc[req.category].push(req);
    return acc;
  }, {} as Record<string, DegreeRequirement[]>);

  // Find syllabus for a course code from enrolled courses
  const getSyllabus = (courseCode: string): Course | undefined =>
    courses.find(c => c.code === courseCode);

  return (
    <StudentLayout title="Academic Requirements">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Academic Requirements</h1>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold text-primary">{progress.completionPercentage}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary opacity-40" />
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${progress.completionPercentage}%` }} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Units Earned</p>
                <p className="text-3xl font-bold text-blue-700">
                  {progress.completedCredits}
                  <span className="text-lg text-gray-500">/{progress.totalRequiredCredits}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{progress.remainingCredits} remaining</p>
              </div>
              <GraduationCap className="w-10 h-10 text-blue-700 opacity-40" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Est. Graduation</p>
                <p className="text-lg font-bold text-green-700">{progress.estimatedGraduation}</p>
                <p className="text-xs text-gray-500 mt-1">{progress.program}</p>
              </div>
              <BookOpen className="w-10 h-10 text-green-700 opacity-40" />
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Requirements by Category */}
        {Object.entries(grouped).map(([category, reqs]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              {category}
              <span className="text-sm font-normal text-gray-500">
                ({reqs.filter(r => r.completed).length}/{reqs.length} completed)
              </span>
            </h2>
            <div className="space-y-3">
              {reqs.map(req => {
                const isExpanded = expandedReq === req.id;
                return (
                  <Card
                    key={req.id}
                    className={`transition-all ${req.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                  >
                    {/* Row */}
                    <button
                      className="w-full flex items-start gap-4 text-left"
                      onClick={() => setExpandedReq(isExpanded ? null : req.id)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {req.completed
                          ? <CheckCircle2 className="w-6 h-6 text-green-600" />
                          : <Circle className="w-6 h-6 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900">{req.title}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${req.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {req.completed ? 'Completed' : 'In Progress'}
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{req.credits} units</p>
                      </div>
                    </button>

                    {/* Expanded: subjects + syllabus */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        {/* Completed subjects */}
                        {req.completedCourses && req.completedCourses.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">Completed Subjects</p>
                            <div className="space-y-2">
                              {req.completedCourses.map(code => {
                                const course = getSyllabus(code);
                                return (
                                  <div key={code} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                      <span className="text-sm font-medium text-gray-800">{code}</span>
                                      {course && <span className="text-sm text-gray-600">— {course.title}</span>}
                                    </div>
                                    {course && (
                                      <span className="text-xs text-gray-500">{course.credits} units</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Remaining / suggested subjects */}
                        {!req.completed && req.suggestedCourses.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">Remaining Subjects</p>
                            <div className="space-y-2">
                              {req.suggestedCourses.map(code => {
                                const course = getSyllabus(code);
                                return (
                                  <div key={code} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Circle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                      <span className="text-sm font-medium text-gray-800">{code}</span>
                                      {course && <span className="text-sm text-gray-600">— {course.title}</span>}
                                    </div>
                                    {course && (
                                      <a
                                        href="#"
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                        onClick={e => e.stopPropagation()}
                                      >
                                        <FileText className="w-3 h-3" />
                                        Syllabus
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Syllabus for currently enrolled courses in this requirement */}
                        {(() => {
                          const enrolledInReq = courses.filter(c =>
                            [...(req.completedCourses || []), ...req.suggestedCourses].includes(c.code) &&
                            c.status === 'enrolled'
                          );
                          if (enrolledInReq.length === 0) return null;
                          return (
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-2">Currently Enrolled</p>
                              {enrolledInReq.map(c => (
                                <div key={c.id} className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-primary">{c.code} — {c.title}</p>
                                      <p className="text-xs text-gray-600 mt-0.5">{c.instructor} · {c.credits} units · {c.semester}</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">Enrolled</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}
