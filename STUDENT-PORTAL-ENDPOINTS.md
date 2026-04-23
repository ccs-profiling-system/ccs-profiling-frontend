# Student Portal — New API Endpoints

These are endpoints introduced exclusively for the student portal. Endpoints already used by the admin side (`/auth/login`, `/events`, `/research`) are excluded.

All requests require `Authorization: Bearer <studentToken>` header.  
Base URL: `VITE_API_URL` (default: `http://localhost:3000/api`)

---

## Student Profile, Dashboard & Progress

Base: `/api/student`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/profile` | Get the authenticated student's profile |
| PUT | `/student/profile` | Update student profile (phone, email, etc.) |
| GET | `/student/dashboard` | Get dashboard summary (GPA, enrolled courses, deadlines) |
| GET | `/student/progress` | Get academic progress toward graduation |
| GET | `/student/financial` | Get financial record (balance, fees, payment history) |

---

## Notifications

Base: `/api/student/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/notifications/` | Get all notifications for the student |
| PATCH | `/student/notifications/:id/read` | Mark a specific notification as read |
| PATCH | `/student/notifications/read-all` | Mark all notifications as read |

---

## Courses & Schedule

Base: `/api/courses`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses/enrolled` | Get all enrolled courses for the current student |
| GET | `/courses/:courseId` | Get a specific course by ID |
| GET | `/courses/schedule` | Get the student's weekly schedule |

---

## Grades

Base: `/api/grades`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/grades/current` | Get grades for the current semester |
| GET | `/grades/:gradeId` | Get a specific grade record by ID |
| GET | `/grades/history` | Get historical grades across all semesters |
| GET | `/grades/gpa` | Get calculated GPA — returns `{ gpa: number }` |

---

## Research (Student-Specific)

The admin side uses `/research` for CRUD management. These are student-facing endpoints on the same base but with different paths:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/research/opportunities` | List available research opportunities |
| GET | `/research/opportunities/:id` | Get a specific opportunity by ID |
| POST | `/research/opportunities/:id/apply` | Submit an application |
| GET | `/research/applications/:applicationId` | Get application status |

---

## Events (Student-Specific)

The admin side uses `/events` for management. These are student-facing registration endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/upcoming` | List upcoming CCS events |
| GET | `/events/registered` | List events the student has registered for |
| POST | `/events/:eventId/register` | Register for an event |
| POST | `/events/:eventId/unregister` | Unregister from an event |

---

## Advisor

Entirely new — no equivalent in the admin side.

Base: `/api/advisor`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/advisor/` | Get the student's assigned advisor info |
| GET | `/advisor/messages` | Get conversation history with advisor |
| POST | `/advisor/messages` | Send a message — body: `{ content: string }` |
| GET | `/advisor/available-slots` | Get available appointment time slots |
| GET | `/advisor/appointments` | Get booked appointments |
| POST | `/advisor/appointments` | Book an appointment — body: `{ date, startTime, endTime }` |
