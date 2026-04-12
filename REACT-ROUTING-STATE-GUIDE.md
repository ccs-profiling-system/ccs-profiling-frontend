# React Routing, State Management & Data Flow Guide
## CCS Profiling System Implementation

---

## Part 1: Client-Side Routing

### Overview
Client-side routing allows navigation between pages without full page reloads using React Router.

### Current Implementation
**File:** `src/app/routes.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Login } from '@/features/auth/Login';
import { EventsPage } from '@/features/admin/events';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/events" element={<EventsPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### How It Works
1. **BrowserRouter** - Wraps all routes and enables client-side routing
2. **Routes** - Container for all route definitions
3. **Route** - Maps URL path to component
4. **Navigate** - Redirects to another route

### Navigation Without Reload
**File:** `src/components/layout/Sidebar.tsx`

```typescript
import { NavLink } from 'react-router-dom';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/events', label: 'Events', icon: Calendar },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
  ];

  return (
    <nav>
      {navLinks.map((link) => (
        <NavLink key={link.to} to={link.to} onClick={onClose}>
          <link.icon className="w-4 h-4" />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

**Key Points:**
- `NavLink` automatically adds active state styling
- Clicking links triggers route change without page reload
- `onClick={onClose}` closes mobile sidebar after navigation

### Expected Output
✅ Navigation menu switches pages instantly
✅ URL updates without full page refresh
✅ Browser back/forward buttons work correctly

---

## Part 2: Dynamic Routing

### Overview
Dynamic routes use URL parameters (`:id`) to display specific resource details.

### Current Implementation - Example 1: Dashboard Aside

**File:** `src/features/admin/dashboard/DashboardAside.tsx` (Line 189)

```typescript
import { useNavigate } from 'react-router-dom';

export function DashboardAside() {
  const navigate = useNavigate();

  // Navigate to event details with dynamic ID
  return (
    <button
      key={event.id}
      onClick={() => navigate(`/events/${event.id}`)}
      className={`w-full p-3 ${colors.bg} border ${colors.border} rounded-lg transition-colors text-left`}
    >
      <div className="flex items-start gap-2">
        <EventIcon className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-sm truncate">{event.title}</p>
          <p className="text-xs text-gray-600 mt-0.5">{formatEventDate(event.startDate)}</p>
        </div>
      </div>
    </button>
  );
}
```

**How it works:**
- User clicks on an upcoming event in the dashboard sidebar
- `onClick={() => navigate(`/events/${event.id}`)}` is triggered
- URL changes to `/events/123` (example)
- Navigates to event detail page

**Key Points:**
- ✅ `useNavigate()` hook imported from react-router-dom
- ✅ Dynamic ID from `event.id` inserted into URL template
- ✅ Arrow function captures event ID from closure
- ✅ Navigates to event detail when clicking upcoming events

---

### Current Implementation - Example 2: Search Modal

**File:** `src/components/search/SearchModal.tsx` (Lines 65-77)

```typescript
import { useNavigate } from 'react-router-dom';
import { searchService, type SearchResult } from '@/services/api';

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the appropriate page based on result type
    switch (result.type) {
      case 'student':
        navigate(`/students/${result.id}`);
        break;
      case 'faculty':
        navigate(`/faculty/${result.id}`);
        break;
      case 'event':
        navigate(`/events/${result.id}`);
        break;
      case 'research':
        navigate(`/research/${result.id}`);
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl">
        {/* Search results */}
        {results.map((result) => (
          <button
            key={`${result.type}-${result.id}`}
            onClick={() => handleResultClick(result)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            {getResultIcon(result.type)}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {result.title}
              </div>
              {result.subtitle && (
                <div className="text-sm text-gray-500 truncate">
                  {result.subtitle}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-400 uppercase">
              {result.type}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**How it works:**
- User performs global search (Cmd+K or Ctrl+K)
- Search results show multiple resource types
- User clicks on a result
- `handleResultClick()` uses switch statement to determine resource type
- Navigates to appropriate detail page using dynamic URL

**Supported Routes:**
- `/students/:id` - Student detail page
- `/faculty/:id` - Faculty detail page
- `/events/:id` - Event detail page
- `/research/:id` - Research detail page

**Key Points:**
- ✅ Uses switch statement for multiple resource types
- ✅ Navigates to `/students/:id`, `/faculty/:id`, `/events/:id`, `/research/:id`
- ✅ Supports 4 different resource types
- ✅ Dynamic ID from `result.id` inserted into URL template
- ✅ Closes modal after navigation with `onClose()`

---

### Data Flow Comparison

**Pattern 1: Simple Navigation (Dashboard)**
```
DashboardAside Component
    ↓
User clicks event button
    ↓
onClick={() => navigate(`/events/${event.id}`)}
    ↓
URL: /events/123
    ↓
Router matches /events/:id
    ↓
EventDetailPage component loads (if route exists)
```

**Pattern 2: Conditional Navigation (Search Modal)**
```
SearchModal Component
    ↓
User performs search
    ↓
Results displayed with type and id
    ↓
User clicks result
    ↓
handleResultClick(result) called
    ↓
switch(result.type) determines route
    ↓
navigate(`/${type}/${result.id}`)
    ↓
URL: /students/123 (example)
    ↓
Router matches /${type}/:id
    ↓
DetailPage component loads (if route exists)
```

### Route Definition (To Be Added)
**File:** `src/app/routes.tsx` - Add these routes:

```typescript
<Route path="/events/:id" element={<EventDetailPage />} />
<Route path="/students/:id" element={<StudentDetailPage />} />
<Route path="/faculty/:id" element={<FacultyDetailPage />} />
<Route path="/research/:id" element={<ResearchDetailPage />} />
```

### Accessing Dynamic Parameters
**Example Component:** `src/features/admin/events/EventDetailPage.tsx` (needs to be created)

```typescript
import { useParams } from 'react-router-dom';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    // Fetch event by ID
    fetchEventById(id).then(setEvent);
  }, [id]);

  return <div>{event?.title}</div>;
}
```

### Expected Output
✅ Clicking event in dashboard navigates to `/events/:id`
✅ Searching and clicking result navigates to appropriate detail page
✅ URL shows `/students/123`, `/faculty/456`, `/events/789`, `/research/101`
✅ Browser back button returns to previous page
✅ Direct URL access works (e.g., typing `/events/123` in address bar)

### Expected Output
✅ Clicking user/event opens detail page
✅ URL shows `/users/123` or `/events/456`
✅ Browser back button returns to list
✅ Direct URL access works (e.g., typing `/users/123` in address bar)

---

## Part 3: Props vs State

### Understanding the Difference

| Aspect | Props | State |
|--------|-------|-------|
| **Definition** | Data passed from parent to child | Data managed within component |
| **Mutability** | Read-only (immutable) | Can be changed (mutable) |
| **Scope** | Parent → Child only | Local to component |
| **Updates** | Parent updates → child re-renders | setState() triggers re-render |

### Current Implementation

#### Parent Component (State)
**File:** `src/features/admin/events/EventsPage.tsx`

```typescript
export function EventsPage() {
  // STATE: Managed in parent
  const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents(); // Fetch data on mount
  }, [fetchEvents]);

  return (
    <div>
      {/* Pass data as PROPS to child */}
      {displayed.map((event) => (
        <EventRow
          key={event.id}
          event={event}
          onEdit={(e) => openEdit(e)}
          onDelete={(id) => handleDelete(id)}
        />
      ))}
    </div>
  );
}
```

#### Child Component (Props)
**File:** `src/features/admin/events/EventFormModal.tsx`

```typescript
interface EventFormModalProps {
  event: Event | null;           // PROP: Event data from parent
  onSave: (payload: CreateEventPayload) => Promise<void>;  // PROP: Callback
  onClose: () => void;           // PROP: Callback
  apiError: string | null;       // PROP: Error from parent
}

export function EventFormModal({
  event,
  onSave,
  onClose,
  apiError,
}: EventFormModalProps) {
  // STATE: Local form state
  const [formData, setFormData] = useState<CreateEventPayload>({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    location: event?.location || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={() => onSave(formData)}>
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
      />
    </form>
  );
}
```

### Data Flow Diagram
```
EventsPage (Parent)
├── State: events[], loading, error
├── Pass as Props ↓
└── EventFormModal (Child)
    ├── Props: event, onSave, onClose, apiError
    ├── State: formData (local)
    └── Calls onSave() → Parent updates state
```

### Best Practices
✅ Keep state as high as needed (parent level)
✅ Pass data down via props
✅ Pass callbacks up via props
✅ Don't prop-drill too deep (use context for global state)

---

## Part 4: Global State Management

### Overview
Global state is accessible from any component without prop drilling.

### Current Implementation: Auth Context
**File:** `src/context/AuthContext.tsx` (if exists, or create it)

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'faculty';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### Usage in Components
**File:** `src/features/admin/dashboard/DashboardAside.tsx`

```typescript
import { useAuth } from '@/context/AuthContext';

export function DashboardAside() {
  const { user } = useAuth(); // Access global state

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### Display Logged-in User Everywhere
**File:** `src/components/layout/Navbar.tsx`

```typescript
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center">
      <h1>CCS Profiling</h1>
      <div className="flex items-center gap-4">
        <span>{user?.name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
```

### Setup in App
**File:** `src/main.tsx`

```typescript
import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from '@/app/routes';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
```

### Expected Output
✅ User name displays in navbar on all pages
✅ User role accessible from any component
✅ No prop drilling needed
✅ Logout clears user from all components

---

## Part 5: Data Flow (One-Way & Controlled Inputs)

### One-Way Data Flow

#### Principle
Data flows from parent → child only. Child cannot directly modify parent state.

#### Implementation
**File:** `src/features/admin/events/EventsPage.tsx`

```typescript
export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Parent manages state
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Filter data in parent
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Pass data DOWN as props */}
      <SearchInput
        value={searchTerm}
        onChange={handleSearch}
      />

      {/* Pass filtered data DOWN */}
      <EventList events={filteredEvents} />
    </div>
  );
}
```

**Child Component:**
```typescript
interface SearchInputProps {
  value: string;
  onChange: (term: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search events..."
    />
  );
}
```

### Controlled Input Pattern

#### What is a Controlled Input?
An input whose value is controlled by React state (not DOM).

#### Implementation
**File:** `src/features/admin/events/EventFormModal.tsx`

```typescript
export function EventFormModal({ event, onSave }: EventFormModalProps) {
  // Controlled state
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
  });

  // Handler updates state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Input is "controlled" - value comes from state
  return (
    <form>
      <input
        name="title"
        value={formData.title}  // ← Controlled by state
        onChange={handleChange}  // ← Updates state
        placeholder="Event title"
      />

      <textarea
        name="description"
        value={formData.description}  // ← Controlled
        onChange={handleChange}
      />

      <button onClick={() => onSave(formData)}>Save</button>
    </form>
  );
}
```

### Data Flow Diagram
```
Parent State (events, searchTerm)
    ↓
Pass as Props ↓
    ↓
Child Component receives props
    ↓
User types in input
    ↓
onChange handler called
    ↓
Calls parent callback: onChange(newValue)
    ↓
Parent updates state
    ↓
Re-render with new props
    ↓
Child displays updated value
```

### Benefits
✅ Single source of truth (parent state)
✅ Easy to debug (state changes are traceable)
✅ Predictable behavior
✅ Easy to add validation

---

## Part 6: Advanced Features

### 6.1 Search Filter Implementation

**File:** `src/features/admin/students/index.tsx` (or create new)

```typescript
import { useState, useMemo } from 'react';

interface Student {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty';
}

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'faculty'>('all');

  // Memoized filtered results
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || student.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [students, searchTerm, roleFilter]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />

      {/* Role Filter */}
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value as any)}
        className="px-4 py-2 border rounded-lg"
      >
        <option value="all">All Roles</option>
        <option value="student">Students</option>
        <option value="faculty">Faculty</option>
      </select>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-600">
          Found {filteredStudents.length} results
        </p>
        <ul className="space-y-2">
          {filteredStudents.map(student => (
            <li key={student.id} className="p-3 border rounded-lg">
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-600">{student.email}</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {student.role}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {filteredStudents.length === 0 && (
        <p className="text-center text-gray-500">No students found</p>
      )}
    </div>
  );
}
```

### 6.2 Role-Based Routing

**File:** `src/components/auth/ProtectedRoute.tsx`

```typescript
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user' | 'faculty';
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

### 6.3 Updated Routes with Role Protection

**File:** `src/app/routes.tsx`

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Login } from '@/features/auth/Login';
import { EventsPage } from '@/features/admin/events';
import { ReportsPage } from '@/features/admin/reports';
import { StudentsPage } from '@/features/admin/students';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - Admin Only */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/events"
          element={
            <ProtectedRoute requiredRole="admin">
              <EventsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <EventDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Reports - Admin Only */}
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Students - Admin Only */}
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute requiredRole="admin">
              <StudentsPage />
            </ProtectedRoute>
          }
        />

        {/* Dynamic Routes */}
        <Route
          path="/admin/students/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <StudentDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 6.4 Prevent Access to Reports if Not Admin

**File:** `src/features/admin/reports/index.tsx`

```typescript
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

export function ReportsPage() {
  const { user } = useAuth();

  // Double-check role (ProtectedRoute should handle this)
  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div>
      <h1>Reports</h1>
      {/* Reports content */}
    </div>
  );
}
```

### 6.5 Unauthorized Page

**File:** `src/features/auth/UnauthorizedPage.tsx`

```typescript
import { useNavigate } from 'react-router-dom';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-xl text-gray-700 mb-6">
        You don't have permission to access this page
      </p>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
```

---

## Summary: Complete Data Flow

```
User Login
    ↓
AuthContext stores user + role
    ↓
User navigates to /admin/students
    ↓
ProtectedRoute checks role
    ↓
If admin → StudentsPage loads
If not admin → Redirect to /unauthorized
    ↓
StudentsPage manages state (students, searchTerm, roleFilter)
    ↓
User types in search → setSearchTerm() updates state
    ↓
useMemo filters students based on search + role
    ↓
Filtered results display
    ↓
User clicks student → navigate(`/admin/students/${id}`)
    ↓
StudentDetailPage loads with useParams()
    ↓
Fetch student data from API
    ↓
Display student details
```

---

## File Structure Reference

```
src/
├── app/
│   └── routes.tsx                 # All route definitions
├── context/
│   └── AuthContext.tsx            # Global auth state
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx     # Role-based route protection
│   │   └── UnauthorizedPage.tsx   # 403 page
│   └── layout/
│       ├── Sidebar.tsx            # Navigation menu
│       ├── Navbar.tsx             # Top bar with user info
│       └── MainLayout.tsx         # Layout wrapper
├── features/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   ├── index.tsx          # Dashboard page
│   │   │   └── DashboardAside.tsx # Sidebar component
│   │   ├── events/
│   │   │   ├── EventsPage.tsx     # Events list
│   │   │   ├── EventDetailPage.tsx # Event details (dynamic)
│   │   │   └── EventFormModal.tsx # Event form
│   │   ├── students/
│   │   │   ├── index.tsx          # Students list with search
│   │   │   └── StudentDetailPage.tsx # Student details
│   │   └── reports/
│   │       └── index.tsx          # Reports (admin only)
│   └── auth/
│       └── Login.tsx              # Login page
└── services/
    └── api/
        ├── eventsService.ts       # Event API calls
        ├── studentsService.ts     # Student API calls
        └── authService.ts         # Auth API calls
```

---

## Key Takeaways

1. **Routing** - Use React Router for client-side navigation
2. **Dynamic Routes** - Use `:id` parameters for detail pages
3. **Props vs State** - Props flow down, state stays local
4. **Global State** - Use Context API for user/auth data
5. **Data Flow** - One-way: parent → child via props
6. **Controlled Inputs** - Value from state, onChange updates state
7. **Role-Based Access** - Use ProtectedRoute wrapper
8. **Search/Filter** - Use useMemo for performance

