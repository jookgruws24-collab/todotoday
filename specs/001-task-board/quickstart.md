# Quick Start Guide: Task Board Application

**Feature**: Task Board Application  
**Date**: 2025-12-26  
**Target Audience**: Developers implementing the feature

---

## Overview

This guide provides a practical introduction to building the Task Board Application. Follow these steps to set up the development environment, understand the architecture, and implement the core features.

---

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm equivalent)
- **Supabase Account**: Free tier sufficient (sign up at https://supabase.com)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (last 2 years)
- **Git**: For version control

---

## Initial Setup (15 minutes)

### 1. Project Initialization

```bash
# Create React app with Vite (fast build tool)
npm create vite@latest frontend -- --template react
cd frontend
npm install

# Install dependencies
npm install @supabase/supabase-js
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Supabase Setup

**A. Create Supabase Project**:
1. Go to https://supabase.com/dashboard
2. Create new project (note: project ID, API URL, anon key)
3. Wait ~2 minutes for database provisioning

**B. Configure Database Schema**:

Run this SQL in Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT title_not_empty CHECK (CHAR_LENGTH(TRIM(title)) > 0),
  CONSTRAINT valid_status CHECK (status IN ('todo', 'in-progress', 'done')),
  CONSTRAINT positive_position CHECK (position >= 0)
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_user_status_position ON tasks(user_id, status, position);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enforce 100-task limit
CREATE OR REPLACE FUNCTION check_task_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM tasks WHERE user_id = NEW.user_id) >= 100 THEN
    RAISE EXCEPTION 'Task limit of 100 per user exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_task_limit
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_task_limit();

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

**C. Enable Email Auth**:
1. Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Disable email confirmations for development (Settings → Auth → Enable email confirmations = OFF)

### 3. Configure Environment Variables

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual Supabase project URL and anon key (Dashboard → Settings → API).

### 4. Configure Tailwind CSS

Edit `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add Tailwind directives to `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Architecture Overview (5 minutes)

### Component Hierarchy

```
App (Auth wrapper)
└── Board (Main container)
    ├── OfflineIndicator (Network status banner)
    ├── AddTaskButton (Opens TaskForm)
    └── DndContext (Drag-and-drop provider)
        └── Columns (Layout container)
            ├── Column (Droppable, status="todo")
            │   └── TaskCard[] (Draggable cards)
            ├── Column (status="in-progress")
            │   └── TaskCard[]
            └── Column (status="done")
                └── TaskCard[]

TaskForm (Modal for create/edit)
```

### Data Flow

```
User Action → Optimistic UI Update → Supabase API Call
                                         ↓
                                    Success/Error
                                         ↓
                                  Real-time Broadcast
                                         ↓
                              Other Tabs Receive Update
                                         ↓
                                  State Sync Complete
```

### Key Services

- `services/supabase.js`: Supabase client configuration
- `services/taskService.js`: Task CRUD operations abstraction
- `hooks/useTasks.js`: Task state management + real-time sync
- `hooks/useOfflineDetection.js`: Network status monitoring
- `hooks/useDragState.js`: Drag queue and state management

---

## Implementation Roadmap

### Phase 1: Foundation (2-3 hours)

**Goal**: Display static task list with authentication

**Tasks**:
1. Create `services/supabase.js` with client initialization
2. Create `App.jsx` with Supabase Auth UI (email/password)
3. Create `services/taskService.js` with `getTasks()` function
4. Create simple `Board.jsx` that fetches and displays tasks
5. Manually add 2-3 tasks via Supabase Dashboard to test

**Success Criteria**: After signing in, see tasks displayed in a basic list.

### Phase 2: UI Components (3-4 hours)

**Goal**: Build responsive task board layout

**Tasks**:
1. Create `Column.jsx` with Tailwind styling (3-column flexbox layout)
2. Create `TaskCard.jsx` with title/description truncation
3. Update `Board.jsx` to group tasks by status and render 3 columns
4. Add responsive breakpoints (vertical stack below 768px)
5. Create `TaskForm.jsx` modal for task creation (no drag yet)

**Success Criteria**: Tasks display in 3 columns, layout adapts on mobile, can create new tasks.

### Phase 3: Drag-and-Drop (4-5 hours)

**Goal**: Implement smooth drag-and-drop with touch support

**Tasks**:
1. Install @dnd-kit dependencies
2. Create `hooks/useDragState.js` for drag queue management
3. Wrap `Board.jsx` with `DndContext` and configure sensors (250ms touch delay)
4. Make `Column.jsx` droppable using `useDroppable` hook
5. Make `TaskCard.jsx` draggable using `useDraggable` hook
6. Implement `handleDragEnd` to update task status and position
7. Add drag visual feedback (transform, opacity, drop zone highlights)

**Success Criteria**: Can drag cards between columns, drag completes with status update, touch drag works after 250ms hold.

### Phase 4: Real-Time Sync (2-3 hours)

**Goal**: Multi-tab synchronization

**Tasks**:
1. Create `hooks/useTasks.js` with Supabase real-time subscription
2. Subscribe to `postgres_changes` on tasks table (filtered by user_id)
3. Handle INSERT/UPDATE/DELETE events and update local state
4. Implement deduplication logic (ignore own updates during drag)
5. Test with 2 browser tabs open

**Success Criteria**: Changes in one tab appear instantly in other tabs, no duplicate updates during drag.

### Phase 5: Offline Mode & Polish (2-3 hours)

**Goal**: Handle offline gracefully, add finishing touches

**Tasks**:
1. Create `hooks/useOfflineDetection.js` monitoring `navigator.onLine`
2. Create `OfflineIndicator.jsx` banner component
3. Disable create/edit/delete/drag when offline
4. Add loading states for async operations
5. Add error handling with user-friendly messages
6. Implement task limit UI (disable add button at 100 tasks)

**Success Criteria**: Offline mode shows banner and blocks modifications, task limit enforced, smooth UX with loading states.

---

## Key Code Snippets

### Supabase Client (`services/supabase.js`)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Task Service (`services/taskService.js`)

```javascript
import { supabase } from './supabase';

export const taskService = {
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('status')
      .order('position');
    
    if (error) throw error;
    return data;
  },

  async createTask({ title, description, status = 'todo' }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        description,
        status,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
```

### Drag-and-Drop Sensors (`Board.jsx`)

```javascript
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

function Board() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250,      // 250ms press-and-hold for touch
        tolerance: 5,    // 5px movement tolerance
      },
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return; // Dropped outside valid zone
    
    const taskId = active.id;
    const newStatus = over.id; // Column IDs are status values
    
    // Optimistic update
    setTasks(prevTasks => /* update local state */);
    
    try {
      await taskService.updateTask(taskId, { status: newStatus });
    } catch (error) {
      // Rollback on error
      setTasks(prevTasks => /* revert state */);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {/* Columns and cards */}
    </DndContext>
  );
}
```

---

## Testing Strategy

### Unit Tests (React Testing Library + Jest)

```javascript
// Example: TaskCard.test.jsx
import { render, screen } from '@testing-library/react';
import TaskCard from './TaskCard';

test('truncates long titles with ellipsis', () => {
  const longTitle = 'A'.repeat(150);
  render(<TaskCard task={{ title: longTitle, description: '' }} />);
  
  const titleElement = screen.getByText(/A+/);
  expect(titleElement).toHaveClass('truncate');
});
```

### Integration Tests

```javascript
// Example: Board drag-and-drop integration test
test('dragging task to new column updates status', async () => {
  // Mock task service
  // Render Board with tasks
  // Simulate drag from "todo" to "in-progress"
  // Assert task status updated in UI and API called
});
```

### E2E Tests (Playwright)

```javascript
// Example: Full workflow test
test('user can create, drag, and delete task', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Sign in
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  
  // Create task
  await page.click('button:has-text("Add Task")');
  await page.fill('input[name="title"]', 'Test Task');
  await page.click('button:has-text("Create")');
  
  // Verify task appears
  await expect(page.locator('text=Test Task')).toBeVisible();
  
  // Drag to in-progress
  await page.dragAndDrop(
    '[data-task-id]:has-text("Test Task")', 
    '[data-column="in-progress"]'
  );
  
  // Verify status change
  await expect(page.locator('[data-column="in-progress"]:has-text("Test Task")')).toBeVisible();
});
```

---

## Performance Checklist

- [ ] Lighthouse CI configured with performance budgets
- [ ] Initial load <1s with 100 tasks (test with seed data)
- [ ] Drag operations maintain 60 FPS (use Performance Observer API)
- [ ] Images optimized and lazy-loaded (if applicable)
- [ ] Bundle size <300KB gzipped (check with `npm run build`)
- [ ] Real-time sync debounced during rapid changes

---

## Common Pitfalls

### 1. RLS Policies Not Working
**Symptom**: Can't fetch tasks, get empty array  
**Solution**: Verify user is authenticated (`supabase.auth.getUser()`), check RLS policies are enabled

### 2. Real-Time Not Updating
**Symptom**: Changes in one tab don't appear in others  
**Solution**: Enable real-time for tasks table (`ALTER PUBLICATION supabase_realtime ADD TABLE tasks`)

### 3. Drag Too Sensitive on Touch
**Symptom**: Accidental drags when scrolling  
**Solution**: Increase `activationConstraint.delay` to 300ms, add `tolerance` buffer

### 4. Task Limit Not Enforced
**Symptom**: Can create more than 100 tasks  
**Solution**: Verify trigger `enforce_task_limit` is created and enabled in database

### 5. Offline Mode Not Detecting
**Symptom**: Can still modify tasks when offline  
**Solution**: Test with Chrome DevTools Network tab (Offline mode), ensure `navigator.onLine` and Supabase channel monitoring both implemented

---

## Next Steps

After completing the MVP implementation:

1. **Write comprehensive tests** (target 80% coverage)
2. **Run Lighthouse audits** and optimize performance
3. **Conduct accessibility audit** with axe-core and screen readers
4. **User testing** with 3-5 real users
5. **Iterate based on feedback**

For detailed implementation specifications, see:
- [data-model.md](./data-model.md) - Database schema and state model
- [contracts/api.yaml](./contracts/api.yaml) - REST API endpoints
- [plan.md](./plan.md) - Full implementation plan

---

**Estimated Total Implementation Time**: 15-20 hours for full MVP

**Questions?** Review the research.md document for technical decision rationale.
