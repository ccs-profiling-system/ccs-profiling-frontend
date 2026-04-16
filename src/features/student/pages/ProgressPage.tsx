import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { 
  GraduationCap, 
  CheckCircle2, 
  Circle, 
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Calendar
} from 'lucide-react';
import type { AcademicProgress, DegreeRequirement } from '../types';
import { studentService } from '@/services/api/studentService';

export function ProgressPage() {
  const [progress, setProgress] = useState<AcademicProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAcademicProgress();
      setProgress(data);
    } catch (error) {
      console.error('Failed to load academic progress:', error);
      setError('Failed to load academic progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading) {
    return (
      <StudentLayout title="Academic Progress">
        <LoadingState text="Loading academic progress..." />
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="Academic Progress">
        <ErrorState message={error} onRetry={loadProgress} />
      </StudentLayout>
    );
  }

  if (!progress) {
    return (
      <StudentLayout title="Academic Progress">
        <Card>
          <p className="text-gray-600">Unable to load academic progress data.</p>
        </Card>
      </StudentLayout>
    );
  }

  // Get unique categories
  const categories = Array.from(
    new Set(progress.requirements.map((req) => req.category))
  );

  // Filter requirements by category
  const filteredRequirements =
    selectedCategory === 'all'
      ? progress.requirements
      : progress.requirements.filter((req) => req.category === selectedCategory);

  // Group requirements by category for display
  const requirementsByCategory = filteredRequirements.reduce((acc, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {} as Record<string, DegreeRequirement[]>);

  return (
    <StudentLayout title="Academic Progress">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-primary" />
            Degree Progress
          </h1>
        </div>

        {/* At-Risk Warning */}
        {progress.isAtRisk && (
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Academic Alert</h3>
                <p className="text-sm text-red-700 mb-2">
                  You are at risk of not meeting graduation requirements on time.
                </p>
                {progress.atRiskReasons && progress.atRiskReasons.length > 0 && (
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    {progress.atRiskReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                )}
                <p className="text-sm text-red-700 mt-2">
                  Please consult with your academic advisor to create a plan.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Completion Percentage */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
                <p className="text-3xl font-bold text-primary">
                  {progress.completionPercentage}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary opacity-50" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.completionPercentage}%` }}
              />
            </div>
          </Card>

          {/* Credits Progress */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Credits Earned</p>
                <p className="text-3xl font-bold text-blue-700">
                  {progress.completedCredits}
                  <span className="text-lg text-gray-600">/{progress.totalRequiredCredits}</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {progress.remainingCredits} units remaining
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-700 opacity-50" />
            </div>
          </Card>

          {/* Estimated Graduation */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Est. Graduation</p>
                <p className="text-lg font-bold text-green-700">
                  {progress.estimatedGraduation}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-green-700 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter by category:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-6">
          {Object.entries(requirementsByCategory).map(([category, requirements]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                {category}
                <span className="text-sm font-normal text-gray-600">
                  ({requirements.filter((r) => r.completed).length}/{requirements.length} completed)
                </span>
              </h2>
              <div className="space-y-3">
                {requirements.map((requirement) => (
                  <Card
                    key={requirement.id}
                    className={`transition-all ${
                      requirement.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {requirement.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      {/* Requirement Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {requirement.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {requirement.credits} units
                              {requirement.completed && requirement.completedDate && (
                                <span className="ml-2 text-green-600">
                                  • Completed on {new Date(requirement.completedDate).toLocaleDateString()}
                                </span>
                              )}
                            </p>

                            {/* Completed Courses */}
                            {requirement.completedCourses && requirement.completedCourses.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  Completed Courses:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {requirement.completedCourses.map((course) => (
                                    <span
                                      key={course}
                                      className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                                    >
                                      {course}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suggested Courses */}
                            {!requirement.completed && requirement.suggestedCourses.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">
                                  Suggested Courses:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {requirement.suggestedCourses.map((course) => (
                                    <span
                                      key={course}
                                      className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                                    >
                                      {course}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className="flex-shrink-0">
                            {requirement.completed ? (
                              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                In Progress
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <Card className="bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              You have completed {progress.completedCredits} out of {progress.totalRequiredCredits} required units
            </p>
            <p className="text-sm text-gray-700 font-medium">
              Keep up the great work! You're {progress.completionPercentage}% of the way to graduation.
            </p>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
