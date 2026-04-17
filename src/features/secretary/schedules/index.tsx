import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Button, SearchBar, Table, Pagination, Modal, Spinner, ErrorAlert } from '@/components/ui';
import { Calendar, Plus } from 'lucide-react';
import { useSchedulesData } from './useSchedulesData';
import secretaryService from '@/services/api/secretaryService';
import type { ClassScheduleInput, ClassSchedule } from '@/types/secretary';
import type { Column } from '@/components/ui/Table';

export function SecretarySchedules() {
  const {
    schedules,
    pagination,
    loading,
    error,
    search,
    setSearch,
    onPageChange,
    onItemsPerPageChange,
    refetch,
  } = useSchedulesData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClassScheduleInput>({
    courseCode: '',
    courseName: '',
    instructorId: '',
    day: '',
    startTime: '',
    endTime: '',
    room: '',
    semester: '1st Semester',
    academicYear: '2025-2026',
    section: '',
  });

  const columns: Column<ClassSchedule>[] = [
    { key: 'courseCode', header: 'Course Code' },
    { key: 'courseName', header: 'Course Name' },
    { key: 'instructorName', header: 'Instructor' },
    { key: 'day', header: 'Day' },
    { 
      key: 'time', 
      header: 'Time',
      render: (schedule) => `${schedule.startTime} - ${schedule.endTime}`
    },
    { key: 'room', header: 'Room' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (selectedSchedule) {
        await secretaryService.updateSchedule(selectedSchedule.id, formData);
      } else {
        await secretaryService.createSchedule(formData);
      }
      
      setShowAddModal(false);
      setSelectedSchedule(null);
      resetForm();
      refetch();
    } catch (err: any) {
      console.error('Failed to save schedule:', err);
      alert(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      instructorId: '',
      day: '',
      startTime: '',
      endTime: '',
      room: '',
      semester: '1st Semester',
      academicYear: '2025-2026',
      section: '',
    });
  };

  const handleEdit = (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      courseCode: schedule.courseCode,
      courseName: schedule.courseName,
      instructorId: schedule.instructorId,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      semester: schedule.semester,
      academicYear: schedule.academicYear,
      section: schedule.section || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (schedule: ClassSchedule) => {
    if (!confirm(`Are you sure you want to delete schedule for ${schedule.courseCode}?`)) {
      return;
    }

    try {
      await secretaryService.deleteSchedule(schedule.id);
      refetch();
      alert('Schedule deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete schedule:', err);
      alert(err.response?.data?.message || 'Failed to delete schedule');
    }
  };

  return (
    <MainLayout title="Class Schedules" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-primary" />
              Class Schedules
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage class and event schedules</p>
          </div>
          <Button
            onClick={() => {
              setSelectedSchedule(null);
              resetForm();
              setShowAddModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Schedule
          </Button>
        </div>

        {error && (
          <ErrorAlert
            title="Error Loading Schedules"
            message={error}
            onRetry={refetch}
            onDismiss={() => {}}
          />
        )}

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by course code or instructor..."
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Days</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Rooms</option>
                <option value="301">Room 301</option>
                <option value="302">Room 302</option>
                <option value="303">Room 303</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" text="Loading schedules..." />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={schedules}
                onRowClick={handleEdit}
              />
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={onPageChange}
                onItemsPerPageChange={onItemsPerPageChange}
              />
            </>
          )}
        </Card>

        {/* Add/Edit Schedule Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedSchedule(null);
          }}
          title={selectedSchedule ? 'Edit Schedule' : 'Add New Schedule'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Introduction to Programming"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructor ID *
              </label>
              <input
                type="text"
                required
                value={formData.instructorId}
                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter instructor ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: In production, this would be a dropdown of available instructors
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day *
                </label>
                <select
                  required
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room *
                </label>
                <input
                  type="text"
                  required
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Room 301"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="A"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester *
                </label>
                <select
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year *
                </label>
                <input
                  type="text"
                  required
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="2025-2026"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button"
                variant="ghost" 
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedSchedule(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : selectedSchedule ? 'Update Schedule' : 'Add Schedule'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}
