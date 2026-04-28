# Export Components (CBA)

Component-Based Architecture for data export functionality.

## Components

### 1. ExportService
Reusable service for exporting data to CSV and PDF formats.

### 2. PDFTemplate
Professional PDF template with customizable design.

## Features

✅ **Reusable** - Use across all modules (Students, Faculty, Research, etc.)
✅ **Type-safe** - Full TypeScript support
✅ **Customizable** - Configure colors, icons, titles
✅ **Professional Design** - Modern, print-optimized layout
✅ **Fallback Support** - Works even if backend is unavailable

## Usage

### Export to PDF

```typescript
import { exportToPDF, createStatusBadge } from '@/components/export';

exportToPDF({
  data: students,
  columns: [
    { key: 'studentId', header: 'Student ID' },
    { key: 'firstName', header: 'Name', render: (s) => `${s.firstName} ${s.lastName}` },
    { key: 'status', header: 'Status', render: (s) => createStatusBadge(s.status) },
  ],
  filename: 'students_report',
  title: 'Students Report',
  subtitle: 'College of Computer Studies',
  icon: '📚',
  primaryColor: '#2563eb',
});
```

### Export to CSV

```typescript
import { exportToCSV } from '@/components/export';

exportToCSV({
  data: students,
  columns: [
    { key: 'studentId', header: 'Student ID' },
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
  ],
  filename: 'students_export',
  title: 'Students Report',
});
```

## PDF Design Features

- **Modern Header** - Gradient border, icon, title, subtitle
- **Meta Information** - Generation date, total count badge
- **Professional Table** - Gradient header, alternating rows, hover effects
- **Status Badges** - Color-coded status indicators
- **Print Button** - Fixed position, gradient background
- **Footer** - Official document footer with timestamp
- **Responsive** - Optimized for both screen and print
- **Print-friendly** - Removes interactive elements when printing

## Customization

### Colors
```typescript
primaryColor: '#2563eb'  // Blue for Students
primaryColor: '#7c3aed'  // Purple for Faculty
primaryColor: '#059669'  // Green for Research
```

### Icons
```typescript
icon: '📚'  // Students
icon: '👨‍🏫'  // Faculty
icon: '🔬'  // Research
icon: '📅'  // Events
```

## Benefits

1. **Consistency** - Same design across all modules
2. **Maintainability** - Update once, applies everywhere
3. **Flexibility** - Easy to customize per module
4. **Professional** - High-quality output
5. **No Dependencies** - Pure HTML/CSS, no external libraries
