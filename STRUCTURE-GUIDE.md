# CCS Profiling System — Frontend Structure Guide

## Overview

This frontend is built using:

* React (TypeScript)
* Vite
* Tailwind CSS

The system is currently **Admin-only UI**, but is structured to support **future multi-role portals**.

---

## Architecture Principles

### 1. Feature-Based Structure

All business logic is inside:

```
src/features/
```

Each feature represents a domain:

* students
* faculty
* events
* scheduling
* research

---

### 2. Separation of Concerns

| Layer      | Purpose     |
| ---------- | ----------- |
| pages      | Screens     |
| components | UI elements |
| services   | API calls   |
| hooks      | logic reuse |
| types      | typings     |

---

### 3. Global Components

Located in:

```
src/components/
```

Used across features:

* UI elements (buttons, inputs)
* layouts (sidebar, navbar)
* feedback (modals, loaders)

---

## 📁 Folder Structure

```
src/
├── app/
├── features/
├── components/
├── services/
├── store/
├── hooks/
├── utils/
├── types/
├── assets/
└── main.tsx
```

---

## Features Breakdown

### Admin Features

All admin UI lives in:

```
features/admin/
```

Includes:

* dashboard
* students
* faculty
* events
* scheduling
* research
* instructions
* reports
* analytics

---

### Future Features

Prepared for:

```
features/
├── student-portal/
├── faculty-portal/
```

---

## Important Design Rules

### 1. Mirror Backend Naming

| Backend  | Frontend |
| -------- | -------- |
| students | students |
| faculty  | faculty  |
| events   | events   |

---

### 2. API Layer is Centralized

All API calls go through:

```
services/apiClient.ts
```

Uses:

* Axios
* Interceptors (auth, errors)

---

### 3. Do NOT Call API Directly in Components

Wrong:

```ts
axios.get(...)
```

Correct:

```ts
studentService.getStudents()
```

---

### 4. Components Must Be Reusable

Avoid:

* duplicate UI
* hardcoded layouts

Use:

* shared components
* consistent spacing & styles

---

## Auth Handling

* Store token securely
* Use global auth context
* Protect routes via wrapper

---

## State Management

Use:

* Context API or Zustand

For:

* auth state
* global loading
* UI state

---

## Dashboard & Analytics

* Data comes from backend aggregation
* Frontend only visualizes

---

## ⚠️ Common Mistakes to Avoid

* Mixing UI and logic
* Large components
* Duplicate API logic
* Hardcoding data

---

## Best Practices

* Keep components small
* Reuse UI elements
* Use hooks for logic
* Follow consistent naming

---

## UI/UX Goals

* Clean admin dashboard
* Clear data hierarchy
* Consistent spacing
* Responsive design

---

## Future Expansion

This structure supports:

* student portal
* faculty portal
* role-based UI
* mobile adaptation

---

## Final Note

Frontend should reflect:

> **Data clarity + usability**

This system is data-heavy — prioritize readability and structure.
