# Task Board Application

A modern, responsive Kanban-style task board built with React, Tailwind CSS, and Supabase.

## Features

- ✅ Create, edit, and delete tasks
- ✅ Drag-and-drop tasks between columns (To Do, In Progress, Done)
- ✅ Real-time synchronization across multiple tabs
- ✅ Offline detection with read-only mode
- ✅ 100-task limit per user enforcement
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessibility (WCAG 2.1 Level AA compliant)
- ✅ Email authentication via Supabase

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 4
- **Drag & Drop**: @dnd-kit
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Testing**: Vitest + React Testing Library + Playwright

## Prerequisites

- Node.js 18+ and npm 9+
- Supabase account (free tier works)

## Setup Instructions

### 1. Clone and Install

```bash
cd todotoday/frontend
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings → API
3. Create `.env.local` file:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migration

Go to Supabase SQL Editor and run the migration script:

```bash
# Copy contents of migrations/001_create_tasks_table.sql
# Paste into Supabase SQL Editor and execute
```

### 4. Enable Authentication

1. Go to Authentication → Providers in Supabase Dashboard
2. Enable "Email" provider
3. For development, disable email confirmations:
   - Settings → Auth → Enable email confirmations = OFF

### 5. Enable Real-time

Run this in Supabase SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Board.jsx          # Main board container
│   │   ├── Column.jsx          # Droppable column
│   │   ├── TaskCard.jsx        # Draggable task card
│   │   ├── TaskForm.jsx        # Create/edit form
│   │   └── OfflineIndicator.jsx # Offline banner
│   ├── hooks/
│   │   ├── useTasks.js         # Task state + real-time
│   │   ├── useOfflineDetection.js
│   │   └── useDragState.js
│   ├── services/
│   │   ├── supabase.js         # Supabase client
│   │   └── taskService.js      # Task CRUD operations
│   ├── utils/
│   │   ├── truncate.js         # Text truncation
│   │   └── validation.js       # Input validation
│   ├── App.jsx                 # Root component
│   └── main.jsx                # Entry point
├── tests/
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
└── migrations/
    └── 001_create_tasks_table.sql
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run end-to-end tests

## Usage

1. **Sign Up**: Create an account with email and password
2. **Create Tasks**: Click "Add Task" button (limit: 100 tasks)
3. **Edit/Delete**: Use buttons on task cards
4. **Drag & Drop**: Drag cards between columns to update status
5. **Real-time Sync**: Open multiple tabs to see live updates
6. **Offline Mode**: App shows banner when offline and blocks modifications

## Architecture Decisions

See `/specs/001-task-board/` for detailed design documents:

- `plan.md` - Implementation plan
- `research.md` - Technical decisions
- `data-model.md` - Database schema
- `contracts/api.yaml` - API specification
- `quickstart.md` - Developer guide

## Performance Targets

- Initial load: <1s with 100 tasks
- Time to Interactive: <3s
- Drag FPS: 60 FPS maintained
- Bundle size: <300KB (gzipped)

## Accessibility

- Keyboard navigation supported
- Screen reader announcements
- 4.5:1 color contrast ratio
- 44x44px touch targets
- Semantic HTML

## Browser Support

- Chrome, Firefox, Safari, Edge (last 2 years)
- Mobile: iOS Safari, Android Chrome

## License

MIT

## Contributing

1. Follow TDD approach (write tests first)
2. Run tests before committing
3. Ensure accessibility compliance
4. Update documentation

## Troubleshooting

### Tasks not loading
- Check Supabase credentials in `.env.local`
- Verify database migration ran successfully
- Check browser console for errors

### Real-time not working
- Ensure real-time is enabled for tasks table
- Check Supabase connection in browser network tab

### Drag-and-drop issues
- Try increasing touch activation delay (250ms → 300ms)
- Clear browser cache and reload

## Support

For issues or questions, see:
- [Supabase Docs](https://supabase.com/docs)
- [@dnd-kit Docs](https://docs.dndkit.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
