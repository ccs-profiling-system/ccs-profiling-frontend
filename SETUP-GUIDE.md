# CCS Profiling System - Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ccs-profiling-frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Tailwind CSS
Create `tailwind.config.js` in the root directory with custom colors:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(234, 88, 12)',
        'primary-dark': 'rgb(194, 65, 12)',
        secondary: 'rgb(239, 68, 68)',
      },
    },
  },
  plugins: [],
}
```

### 4. Update CSS Entry Point
Ensure `src/index.css` includes Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
}
```

### 5. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Serve production build

## Project Structure

```
ccs-profiling-frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx           # Main app component
│   │   ├── providers/        # Context providers
│   │   └── routes.tsx        # Route configuration
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components (Navbar, Sidebar)
│   │   └── index.ts         # Component exports
│   ├── features/
│   │   ├── admin/           # Admin features
│   │   │   ├── dashboard/
│   │   │   ├── reports/
│   │   │   ├── instructions/
│   │   │   └── ...
│   │   └── auth/            # Authentication
│   ├── services/
│   │   └── api/             # API service layer
│   ├── store/               # State management
│   ├── types/               # TypeScript types
│   ├── config/              # Configuration files
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Custom Tailwind Colors Usage

### Primary Color (Orange)
- Buttons: `bg-primary hover:bg-primary-dark`
- Active states: `text-primary`
- Highlights: `border-primary`

### Secondary Color (Red)
- Warnings: `bg-secondary`
- Badges: `text-secondary`
- Critical indicators: `border-secondary`

### Example Component
```tsx
<button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded">
  Click Me
</button>
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

## Development Guidelines

1. Use functional components with hooks
2. Follow component-based architecture
3. Keep components small and focused
4. Use TypeScript for type safety
5. Use custom Tailwind colors (no hardcoded colors)
6. Maintain clean folder structure
7. Create reusable components in `components/ui`
8. Feature-specific components go in `features/`

## Next Steps

1. Configure Tailwind with custom colors
2. Build global layout (Navbar, Sidebar)
3. Implement dashboard
4. Create reports module
5. Build instruction module
6. Add global search functionality
