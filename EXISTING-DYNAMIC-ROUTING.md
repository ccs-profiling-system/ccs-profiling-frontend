# Existing Dynamic Routing Implementations

## Overview
Your application already uses dynamic routing in multiple places. Here's a comprehensive breakdown of all implementations.

---

## 1. Dashboard Aside - Event Navigation

**File:** `src/features/admin/dashboard/DashboardAside.tsx` (Line 189)

```typescript
import { useNavigate } from 'react-router-dom';

export function DashboardAside() {
  const navigate = useNavigate();

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
- `navigate(`/events/${event.id}`)` is called
- URL changes to `/events/123` (example)
- Navigates to event detail page

**Data Flow:**
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

---

## 2. Search Modal - Multi-Resource Navigation

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
    <div>
      {/* Search input and results */}
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
  );
}
```

**How it works:**
- User performs global search (Cmd+K or Ctrl+K)
- Search results show multiple resource types
- User clicks on a result
- `handleResultClick()` determines resource type
- Navigates to appropriate detail page using switch statement

**Supported Routes:**
- `/students/:id` - Student detail page
- `/faculty/:id` - Faculty detail page
- `/events/:id` - Event detail page
- `/research/:id` - Research detail page

**Data Flow:**
```
SearchModal Component
    ↓
User types search query
    ↓
searchService.globalSearch(query) called
    ↓
Results returned with type and id
    ↓
User clicks result
    ↓
handleResultClick(result) called
    ↓
switch(result.type) determines route
    ↓
navigate(`/${type}/${result.id}`)
    ↓
URL changes to /students/123 (example)
    ↓
Detail page component loads
```

---

## 3. Pattern Comparison

### Pattern 1: Simple Navigation (Dashboard)
```typescript
onClick={() => navigate(`/events/${event.id}`)}
```
- Direct navigation
- Single resource type
- Simple and straightforward

### Pattern 2: Conditional Navigation (Search Modal)
```typescript
switch (result.type) {
  case 'student':
    navigate(`/students/${result.id}`);
    break;
  case 'faculty':
    navigate(`/faculty/${result.id}`);
    break;
  // ... more cases
}
```
- Multiple resource types
- Conditional routing based on type
- More flexible and scalable

---

## 4. Key Components Used

### useNavigate Hook
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate(`/events/${event.id}`);
```
- Programmatic navigation
- Used in event handlers
- Returns a function to navigate

### Dynamic URL Parameters
```typescript
`/events/${event.id}`
`/students/${result.id}`
`/faculty/${result.id}`
`/research/${result.id}`
```
- Template literals for dynamic values
- ID extracted from data object
- Creates unique URLs per resource

### Event Handlers
```typescript
onClick={() => navigate(`/events/${event.id}`)}
```
- Arrow function in onClick
- Captures event ID from closure
- Executes navigation on click

---

## 5. What's Missing (Not Yet Implemented)

### Missing Routes in routes.tsx
```typescript
// These routes are NOT defined yet:
<Route path="/events/:id" element={<EventDetailPage />} />
<Route path="/students/:id" element={<StudentDetailPage />} />
<Route path="/faculty/:id" element={<FacultyDetailPage />} />
<Route path="/research/:id" element={<ResearchDetailPage />} />
```

### Missing Detail Pages
- `EventDetailPage.tsx` - Not created
- `StudentDetailPage.tsx` - Not created
- `FacultyDetailPage.tsx` - Not created
- `ResearchDetailPage.tsx` - Not created

### Missing useParams Implementation
```typescript
// These are NOT implemented yet:
const { id } = useParams<{ id: string }>();
```

---

## 6. Complete Implementation Needed

To fully implement dynamic routing, you need:

### Step 1: Add Routes
```typescript
// src/app/routes.tsx
<Route path="/events/:id" element={<EventDetailPage />} />
<Route path="/students/:id" element={<StudentDetailPage />} />
<Route path="/faculty/:id" element={<FacultyDetailPage />} />
<Route path="/research/:id" element={<ResearchDetailPage />} />
```

### Step 2: Create Detail Pages
```typescript
// src/features/admin/events/EventDetailPage.tsx
import { useParams } from 'react-router-dom';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  // Fetch and display event details
}
```

### Step 3: Update List Pages
```typescript
// src/features/admin/events/EventsPage.tsx
<tr onClick={() => navigate(`/admin/events/${event.id}`)}>
  {/* Row content */}
</tr>
```

---

## 7. Current State Summary

| Feature | Status | Location |
|---------|--------|----------|
| useNavigate hook | ✅ Implemented | DashboardAside, SearchModal |
| Dynamic URL creation | ✅ Implemented | DashboardAside, SearchModal |
| Event handlers | ✅ Implemented | DashboardAside, SearchModal |
| Route definitions | ❌ Missing | routes.tsx |
| Detail pages | ❌ Missing | Not created |
| useParams hook | ❌ Missing | Not implemented |
| Data fetching by ID | ❌ Missing | Not implemented |

---

## 8. How to Complete Implementation

### For Events:
1. Create `src/features/admin/events/EventDetailPage.tsx`
2. Add route: `<Route path="/events/:id" element={<EventDetailPage />} />`
3. Implement `useParams()` to extract ID
4. Fetch event data using ID
5. Display event details

### For Students:
1. Create `src/features/admin/students/StudentDetailPage.tsx`
2. Add route: `<Route path="/students/:id" element={<StudentDetailPage />} />`
3. Implement `useParams()` to extract ID
4. Fetch student data using ID
5. Display student details

### For Faculty:
1. Create `src/features/admin/faculty/FacultyDetailPage.tsx`
2. Add route: `<Route path="/faculty/:id" element={<FacultyDetailPage />} />`
3. Implement `useParams()` to extract ID
4. Fetch faculty data using ID
5. Display faculty details

### For Research:
1. Create `src/features/admin/research/ResearchDetailPage.tsx`
2. Add route: `<Route path="/research/:id" element={<ResearchDetailPage />} />`
3. Implement `useParams()` to extract ID
4. Fetch research data using ID
5. Display research details

---

## 9. Testing Current Implementation

### Test 1: Dashboard Navigation
1. Go to `/admin/dashboard`
2. Look for "Upcoming Events" section
3. Click on an event
4. URL should change to `/events/123` (or similar)
5. Currently shows 404 because route doesn't exist

### Test 2: Search Navigation
1. Press Cmd+K (Mac) or Ctrl+K (Windows)
2. Type a search query
3. Click on a result
4. URL should change to `/students/123` (or similar)
5. Currently shows 404 because route doesn't exist

---

## 10. Next Steps

1. **Create detail page components** - EventDetailPage, StudentDetailPage, etc.
2. **Add routes to routes.tsx** - Define all dynamic routes
3. **Implement useParams** - Extract ID from URL
4. **Fetch data by ID** - Use API services to get resource details
5. **Display details** - Render resource information
6. **Add back navigation** - Allow users to return to list
7. **Add edit/delete** - Optional CRUD operations

---

## Summary

Your application **already has the foundation** for dynamic routing:
- ✅ useNavigate hook is used correctly
- ✅ Dynamic URLs are created properly
- ✅ Event handlers are set up
- ✅ Search modal supports multiple resource types

What's **missing** is:
- ❌ Route definitions for detail pages
- ❌ Detail page components
- ❌ useParams implementation
- ❌ Data fetching by ID

The infrastructure is in place. You just need to complete the detail pages and routes!

