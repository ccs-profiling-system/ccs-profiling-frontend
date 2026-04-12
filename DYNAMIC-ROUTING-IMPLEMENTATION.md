# Dynamic Routing Implementation Guide

## Overview
Dynamic routing allows you to create detail pages for individual resources (events, students, faculty, etc.) using URL parameters like `/events/:id`, `/students/:id`, etc.

---

## Step 1: Add Dynamic Routes to routes.tsx

**File:** `src/app/routes.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Login } from '@/features/auth/Login';
import { EventsPage } from '@/features/admin/events';
import { EventDetailPage } from '@/features/admin/events/EventDetailPage';  // NEW
import { Students } from '@/features/admin/students';
import { StudentDetailPage } from '@/features/admin/students/StudentDetailPage';  // NEW
import { Faculty } from '@/features/admin/faculty';
import { FacultyDetailPage } from '@/features/admin/faculty/FacultyDetailPage';  // NEW
import { Reports } from '@/features/admin/reports';
import { Instructions } from '@/features/admin/instructions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Events - List & Detail */}
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/:id"
          element={
            <ProtectedRoute>
              <EventDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Students - List & Detail */}
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:id"
          element={
            <ProtectedRoute>
              <StudentDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Faculty - List & Detail */}
        <Route
          path="/admin/faculty"
          element={
            <ProtectedRoute>
              <Faculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty/:id"
          element={
            <ProtectedRoute>
              <FacultyDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Instructions */}
        <Route
          path="/admin/instructions"
          element={
            <ProtectedRoute>
              <Instructions />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Step 2: Create Detail Page Components

### Example 1: EventDetailPage

**File:** `src/features/admin/events/EventDetailPage.tsx`

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MainLayout, Card, Spinner, ErrorAlert } from '@/components/layout';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import type { Event } from './types';
import eventsService from '@/services/api/eventsService';

export function EventDetailPage() {
  // Extract ID from URL parameter
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch event data on mount
  useEffect(() => {
    if (!id) {
      setError('Event ID not found');
      setLoading(false);
      return;
    }

    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsService.getEventById(id!);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventsService.deleteEvent(id!);
      navigate('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  const handleEdit = () => {
    navigate(`/admin/events/${id}/edit`);
  };

  if (loading) {
    return (
      <MainLayout title="Event Details">
        <div className="h-64">
          <Spinner size="lg" text="Loading event details..." />
        </div>
      </MainLayout>
    );
  }

  if (error || !event) {
    return (
      <MainLayout title="Event Details">
        <ErrorAlert
          title="Error"
          message={error || 'Event not found'}
          onRetry={fetchEvent}
          onDismiss={() => navigate('/admin/events')}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Event Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/events')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Back to events"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-sm text-gray-600 mt-1">Event ID: {event.id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Description */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </Card>

            {/* Event Info */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(event.date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-900 capitalize">{event.type}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Status</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'upcoming'
                  ? 'bg-blue-100 text-blue-700'
                  : event.status === 'ongoing'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </Card>

            {/* Participants */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Participants</h3>
              <p className="text-2xl font-bold text-gray-900">
                {event.participants?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">people registered</p>
            </Card>

            {/* Created Info */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Created</h3>
              <p className="text-sm text-gray-700">
                {new Date(event.createdAt).toLocaleDateString()}
              </p>
              <h3 className="text-sm font-semibold text-gray-600 mt-3 mb-2">Last Updated</h3>
              <p className="text-sm text-gray-700">
                {new Date(event.updatedAt).toLocaleDateString()}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
```

### Example 2: StudentDetailPage

**File:** `src/features/admin/students/StudentDetailPage.tsx`

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MainLayout, Card, Spinner, ErrorAlert } from '@/components/layout';
import { ArrowLeft, Edit, Trash2, Mail, BookOpen, Calendar } from 'lucide-react';
import type { Student } from '@/types/students';
import studentsService from '@/services/api/studentsService';

export function StudentDetailPage() {
  // Extract ID from URL parameter
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student data on mount
  useEffect(() => {
    if (!id) {
      setError('Student ID not found');
      setLoading(false);
      return;
    }

    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentsService.getStudentById(id!);
      setStudent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await studentsService.deleteStudent(id!);
      navigate('/admin/students');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete student');
    }
  };

  const handleEdit = () => {
    navigate(`/admin/students/${id}/edit`);
  };

  if (loading) {
    return (
      <MainLayout title="Student Details">
        <div className="h-64">
          <Spinner size="lg" text="Loading student details..." />
        </div>
      </MainLayout>
    );
  }

  if (error || !student) {
    return (
      <MainLayout title="Student Details">
        <ErrorAlert
          title="Error"
          message={error || 'Student not found'}
          onRetry={fetchStudent}
          onDismiss={() => navigate('/admin/students')}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Student Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/students')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Back to students"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">ID: {student.studentId}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contact Information */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{student.email}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Academic Information */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Program</p>
                    <p className="font-medium text-gray-900">{student.program}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Year Level</p>
                    <p className="font-medium text-gray-900">Year {student.yearLevel}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Section</p>
                  <p className="font-medium text-gray-900">{student.section || 'N/A'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Status</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                student.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : student.status === 'graduated'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {student.status?.charAt(0).toUpperCase() + (student.status?.slice(1) || '')}
              </span>
            </Card>

            {/* Enrollment Date */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Enrollment Date</h3>
              <p className="text-sm text-gray-700">
                {student.enrollmentDate
                  ? new Date(student.enrollmentDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </Card>

            {/* Created Info */}
            <Card>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Created</h3>
              <p className="text-sm text-gray-700">
                {student.createdAt
                  ? new Date(student.createdAt).toLocaleDateString()
                  : 'N/A'}
              </p>
              <h3 className="text-sm font-semibold text-gray-600 mt-3 mb-2">Last Updated</h3>
              <p className="text-sm text-gray-700">
                {student.updatedAt
                  ? new Date(student.updatedAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
```

---

## Step 3: Update List Pages to Navigate to Detail Pages

### Update EventsPage

**File:** `src/features/admin/events/EventsPage.tsx`

Add click handler to navigate to detail page:

```typescript
import { useNavigate } from 'react-router-dom';

export function EventsPage() {
  const navigate = useNavigate();
  // ... existing code ...

  return (
    <div>
      {/* ... existing code ... */}
      
      {/* In the table row, add onClick handler */}
      <tr
        key={event.id}
        onClick={() => navigate(`/admin/events/${event.id}`)}
        className="hover:bg-gray-50 cursor-pointer"
      >
        <td className="px-6 py-4 font-medium">{event.title}</td>
        {/* ... rest of row ... */}
      </tr>
    </div>
  );
}
```

### Update StudentsPage

**File:** `src/features/admin/students/index.tsx`

Add click handler to navigate to detail page:

```typescript
import { useNavigate } from 'react-router-dom';

export function StudentsPage() {
  const navigate = useNavigate();
  // ... existing code ...

  return (
    <div>
      {/* ... existing code ... */}
      
      {/* In the table row, add onClick handler */}
      <tr
        key={student.id}
        onClick={() => navigate(`/admin/students/${student.id}`)}
        className="hover:bg-gray-50 cursor-pointer"
      >
        <td className="px-6 py-4 font-medium">
          {student.firstName} {student.lastName}
        </td>
        {/* ... rest of row ... */}
      </tr>
    </div>
  );
}
```

---

## Step 4: How Dynamic Routing Works

### Data Flow Diagram

```
User clicks on event/student row
    ↓
navigate(`/admin/events/${event.id}`) called
    ↓
URL changes to /admin/events/123
    ↓
Router matches route: /admin/events/:id
    ↓
EventDetailPage component mounts
    ↓
useParams() extracts { id: "123" }
    ↓
useEffect runs with id dependency
    ↓
fetchEvent(id) called
    ↓
API call: GET /events/123
    ↓
Response received
    ↓
setEvent(data) updates state
    ↓
Component re-renders with event details
    ↓
User sees detail page
```

### Key Concepts

**1. URL Parameter Extraction:**
```typescript
const { id } = useParams<{ id: string }>();
```

**2. Dependency on Parameter:**
```typescript
useEffect(() => {
  if (!id) return;
  fetchData(id);
}, [id]); // Re-fetch if ID changes
```

**3. Navigation to Detail Page:**
```typescript
const navigate = useNavigate();
navigate(`/admin/events/${event.id}`);
```

**4. Back Navigation:**
```typescript
<button onClick={() => navigate('/admin/events')}>
  Back to Events
</button>
```

---

## Step 5: Add Edit Routes (Optional)

For edit functionality, add edit routes:

```typescript
<Route
  path="/admin/events/:id/edit"
  element={
    <ProtectedRoute>
      <EventEditPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/students/:id/edit"
  element={
    <ProtectedRoute>
      <StudentEditPage />
    </ProtectedRoute>
  }
/>
```

---

## Complete Implementation Checklist

- [ ] Add dynamic routes to `src/app/routes.tsx`
- [ ] Create `EventDetailPage.tsx`
- [ ] Create `StudentDetailPage.tsx`
- [ ] Create `FacultyDetailPage.tsx` (if needed)
- [ ] Update `EventsPage.tsx` with navigation
- [ ] Update `StudentsPage.tsx` with navigation
- [ ] Update `Faculty.tsx` with navigation (if needed)
- [ ] Test navigation from list to detail page
- [ ] Test back button functionality
- [ ] Test URL parameter extraction
- [ ] Test API calls with correct IDs

---

## Testing Dynamic Routing

### Test Case 1: Navigate to Detail Page
1. Go to `/admin/events`
2. Click on an event row
3. URL should change to `/admin/events/123`
4. Event details should load

### Test Case 2: Direct URL Access
1. Type `/admin/events/123` in address bar
2. Detail page should load with correct event
3. API should be called with ID 123

### Test Case 3: Back Navigation
1. On detail page, click back button
2. Should return to list page
3. URL should change back to `/admin/events`

### Test Case 4: Invalid ID
1. Type `/admin/events/invalid-id` in address bar
2. Should show error message
3. Should provide option to go back

---

## Summary

Dynamic routing enables:
- ✅ Individual detail pages for each resource
- ✅ Shareable URLs (e.g., `/admin/events/123`)
- ✅ Browser back/forward navigation
- ✅ Direct URL access to detail pages
- ✅ RESTful URL structure

This pattern is used across Events, Students, Faculty, and other resources in your application.

