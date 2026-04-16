import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import type { Course } from '../types';
import { courseService } from '@/services/api/courseService';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

// Map short day names to full names
const DAY_MAP: Record<string, string> = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday',
  'Sun': 'Sunday',
  'Monday': 'Monday',
  'Tuesday': 'Tuesday',
  'Wednesday': 'Wednesday',
  'Thursday': 'Thursday',
  'Friday': 'Friday',
  'Saturday': 'Saturday',
  'Sunday': 'Sunday',
};

interface ScheduleEvent {
  course: Course;
  day: string;
  startTime: string;
  endTime: string;
}

export function SchedulePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getEnrolledCourses();
      setCourses(data.filter(c => c.status === 'enrolled'));
    } catch (error) {
      console.error('Failed to load courses:', error);
      setError('Failed to load schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Convert courses to schedule events
  const scheduleEvents: ScheduleEvent[] = courses.flatMap(course =>
    course.schedule.days.map(day => ({
      course,
      day: DAY_MAP[day] || day,
      startTime: course.schedule.startTime,
      endTime: course.schedule.endTime,
    }))
  );

  // Get events for a specific day and time slot
  const getEventsForSlot = (day: string, timeSlot: string): ScheduleEvent[] => {
    return scheduleEvents.filter(event => {
      if (event.day !== day) return false;
      
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const startHour = parseInt(event.startTime.split(':')[0]);
      const endHour = parseInt(event.endTime.split(':')[0]);
      
      return slotHour >= startHour && slotHour < endHour;
    });
  };

  // Get unique days that have classes
  const activeDays = DAYS_OF_WEEK.filter(day =>
    scheduleEvents.some(event => event.day === day)
  );

  if (loading) {
    return (
      <StudentLayout title="Schedule">
        <LoadingState text="Loading schedule..." />
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="Schedule">
        <ErrorState message={error} onRetry={loadCourses} />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Schedule">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary" />
            Weekly Schedule
          </h1>
          <span className="text-sm text-gray-600">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'} enrolled
          </span>
        </div>

        {courses.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No enrolled courses to display.</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Weekly Calendar View */}
            <Card>
              <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-px bg-gray-200">
                  {/* Header Row */}
                  <div className="bg-gray-50 p-3 font-semibold text-sm text-gray-700">
                    Time
                  </div>
                  {DAYS_OF_WEEK.map(day => (
                    <div
                      key={day}
                      className={`bg-gray-50 p-3 font-semibold text-sm text-center ${
                        activeDays.includes(day) ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {day}
                    </div>
                  ))}

                  {/* Time Slots */}
                  {TIME_SLOTS.map(timeSlot => (
                    <div key={timeSlot} className="contents">
                      <div className="bg-white p-3 text-sm text-gray-600 font-medium">
                        {timeSlot}
                      </div>
                      {DAYS_OF_WEEK.map(day => {
                        const events = getEventsForSlot(day, timeSlot);
                        return (
                          <div
                            key={`${day}-${timeSlot}`}
                            className="bg-white p-2 min-h-[80px]"
                          >
                            {events.map((event, idx) => (
                              <div
                                key={`${event.course.id}-${idx}`}
                                className="bg-primary/10 border-l-4 border-primary rounded p-2 mb-1 text-xs"
                              >
                                <p className="font-semibold text-primary mb-1">
                                  {event.course.code}
                                </p>
                                <p className="text-gray-700 mb-1 line-clamp-1">
                                  {event.course.title}
                                </p>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-3 h-3" />
                                  <span>{event.startTime} - {event.endTime}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{event.course.schedule.location}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </Card>

            {/* Course List with Consultation Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map(course => (
                <Card key={course.id}>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">{course.code}</p>
                      <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{course.instructor}</p>
                          <p className="text-gray-600">{course.instructorEmail}</p>
                          <p className="text-gray-600">{course.instructorPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-700">
                            {course.schedule.days.join(', ')}
                          </p>
                          <p className="text-gray-600">
                            {course.schedule.startTime} - {course.schedule.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{course.schedule.location}</p>
                      </div>
                    </div>

                    {/* Consultation Hours Section */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Instructor Consultation Hours
                      </p>
                      <p className="text-xs text-gray-600">
                        Contact instructor for consultation schedule
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}
