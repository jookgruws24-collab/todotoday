# Data Model: Task Board Application

**Feature**: Task Board Application  
**Date**: 2025-12-26  
**Status**: Complete

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the Task Board Application. The data model supports single-user operation with multi-user infrastructure (user-scoped data).

---

## Entities

### 1. User

Represents an authenticated application user. Managed by Supabase Auth.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier (from Supabase auth.users) |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address for authentication |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |

**Managed By**: Supabase Auth (not directly in application database)

**Relationships**:
- One User → Many Tasks (1:N)

**Notes**:
- User management handled entirely by Supabase Auth
- Application only references `user_id` for data scoping
- Single-user MVP, but infrastructure supports future multi-user

---

### 2. Task

Represents a work item tracked on the task board.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique task identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → auth.users(id) | Owner of the task |
| `title` | VARCHAR(100) | NOT NULL, CHECK (CHAR_LENGTH(TRIM(title)) > 0) | Task title (required, non-empty) |
| `description` | TEXT | NULLABLE | Optional detailed description |
| `status` | VARCHAR(20) | NOT NULL, CHECK (status IN ('todo', 'in-progress', 'done')) | Current workflow status |
| `position` | INTEGER | NOT NULL, DEFAULT 0 | Display order within status column |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last modification timestamp |

**Indexes**:
- `idx_tasks_user_id` ON `user_id` (for efficient user-scoped queries)
- `idx_tasks_status` ON `status` (for column filtering)
- `idx_tasks_user_status_position` ON `(user_id, status, position)` (for sorted column queries)

**Validation Rules**:
- `title`: 1-100 characters, cannot be empty or whitespace-only
- `description`: 0-1000 characters (optional)
- `status`: Must be one of: `'todo'`, `'in-progress'`, `'done'`
- `position`: Non-negative integer, determines order within column

**Database Constraints**:
```sql
-- Task limit enforcement: max 100 tasks per user
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

-- Auto-update updated_at timestamp
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Row Level Security (RLS)**:
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

**Relationships**:
- Many Tasks → One User (N:1)

---

### 3. Board (Virtual Entity)

The Board is not a database entity but a UI abstraction representing the collection of tasks grouped by status.

**Structure** (in application state):
```typescript
interface Board {
  columns: {
    todo: Task[];
    'in-progress': Task[];
    done: Task[];
  };
  metadata: {
    totalTasks: number;
    isOffline: boolean;
    isDragging: boolean;
  };
}
```

**Derived From**:
- Tasks query: `SELECT * FROM tasks WHERE user_id = $1 ORDER BY status, position`
- Grouped in frontend by `status` field

**No Database Persistence**: Board state is dynamically computed from tasks.

---

## State Transitions

### Task Status Lifecycle

```
[CREATE] → todo
   ↓
todo ⇄ in-progress ⇄ done
   ↓         ↓         ↓
        [DELETE]
```

**Valid Transitions**:
- `null` → `todo` (task creation)
- `todo` → `in-progress` (user drags to In Progress column)
- `todo` → `done` (user drags directly to Done column)
- `in-progress` → `todo` (user drags back to To Do)
- `in-progress` → `done` (user drags to Done column)
- `done` → `in-progress` (user drags back to In Progress)
- `done` → `todo` (user drags back to To Do)
- Any status → `null` (task deletion)

**No Invalid Transitions**: All status changes are valid (user can move tasks freely between columns).

**Transition Triggers**:
- User drag-and-drop operation (visual drag → drop → status update)
- Each transition updates `updated_at` timestamp
- Real-time sync broadcasts status change to other tabs

---

## Data Model Diagram

```
┌─────────────────────┐
│   Supabase Auth     │
│   ────────────────  │
│   User (id, email)  │
└──────────┬──────────┘
           │ 1
           │
           │ N
┌──────────▼──────────────────────────────────┐
│   Task                                       │
│   ──────────────────────────────────────    │
│   id (PK)                                    │
│   user_id (FK) ────> Supabase Auth User     │
│   title (VARCHAR 100, NOT NULL)             │
│   description (TEXT, NULLABLE)              │
│   status (VARCHAR 20, NOT NULL)             │
│   position (INTEGER, NOT NULL)              │
│   created_at (TIMESTAMPTZ)                  │
│   updated_at (TIMESTAMPTZ)                  │
│                                              │
│   Constraints:                               │
│   - CHECK: status IN ('todo', 'in-progress',│
│            'done')                           │
│   - CHECK: title not empty                   │
│   - TRIGGER: max 100 tasks per user_id      │
│   - RLS: user_id = auth.uid()               │
└──────────────────────────────────────────────┘
           │
           │ Grouped by status
           ▼
┌──────────────────────────────────────┐
│   Board (Virtual/UI Only)            │
│   ──────────────────────────────     │
│   columns:                            │
│     - todo: Task[]                   │
│     - in-progress: Task[]            │
│     - done: Task[]                   │
│                                       │
│   metadata:                           │
│     - totalTasks: number             │
│     - isOffline: boolean             │
│     - isDragging: boolean            │
└──────────────────────────────────────┘
```

---

## Database Schema (SQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT title_not_empty CHECK (CHAR_LENGTH(TRIM(title)) > 0),
  CONSTRAINT valid_status CHECK (status IN ('todo', 'in-progress', 'done')),
  CONSTRAINT positive_position CHECK (position >= 0)
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_user_status_position ON tasks(user_id, status, position);

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on task modifications
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Enforce 100 task limit per user
CREATE OR REPLACE FUNCTION check_task_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM tasks WHERE user_id = NEW.user_id) >= 100 THEN
    RAISE EXCEPTION 'Task limit of 100 per user exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Enforce task limit on insert
CREATE TRIGGER enforce_task_limit
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION check_task_limit();

-- Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Application State Model

### Client-Side State (React)

```typescript
interface AppState {
  // Auth state
  user: {
    id: string;
    email: string;
  } | null;
  
  // Task data
  tasks: Task[];
  
  // UI state
  ui: {
    isOffline: boolean;
    isDragging: boolean;
    dragQueue: DragEvent[];
    taskCount: number;
    loading: boolean;
    error: string | null;
  };
  
  // Form state
  form: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    editingTaskId: string | null;
    title: string;
    description: string;
    errors: ValidationErrors;
  };
}
```

### State Management Strategy

**Recommendation**: React Context + useReducer (sufficient for MVP)

**Rationale**:
- Single-user application with limited state complexity
- ~100 tasks max = manageable state size
- Real-time updates handled by Supabase subscriptions
- Avoid Redux overhead for simple use case

**State Updates**:
- Optimistic UI: Update local state immediately, rollback on error
- Real-time sync: Supabase subscription updates state on remote changes
- Persistence: All mutations call Supabase API, trigger real-time broadcasts

---

## Data Access Patterns

### Common Queries

1. **Load all tasks for user** (initial page load):
   ```sql
   SELECT * FROM tasks 
   WHERE user_id = $1 
   ORDER BY status, position;
   ```
   - Uses index: `idx_tasks_user_status_position`
   - Expected performance: <50ms for 100 tasks

2. **Get task count for user** (check limit):
   ```sql
   SELECT COUNT(*) FROM tasks WHERE user_id = $1;
   ```
   - Uses index: `idx_tasks_user_id`
   - Expected performance: <10ms

3. **Create new task**:
   ```sql
   INSERT INTO tasks (user_id, title, description, status, position)
   VALUES ($1, $2, $3, 'todo', (
     SELECT COALESCE(MAX(position), -1) + 1 
     FROM tasks 
     WHERE user_id = $1 AND status = 'todo'
   ))
   RETURNING *;
   ```
   - Automatically assigns next position in todo column
   - Trigger checks 100-task limit

4. **Update task status** (drag-and-drop):
   ```sql
   UPDATE tasks 
   SET status = $2, position = $3, updated_at = NOW()
   WHERE id = $1 AND user_id = $4
   RETURNING *;
   ```
   - Position recalculated in frontend based on drop location
   - RLS ensures user can only update own tasks

5. **Delete task**:
   ```sql
   DELETE FROM tasks 
   WHERE id = $1 AND user_id = $2;
   ```
   - RLS enforced, cascade delete on user deletion

### Performance Considerations

- All queries use indexes for fast lookups
- User-scoped queries prevent cross-user data leakage
- Position field enables drag-and-drop ordering without complex logic
- Real-time subscriptions filtered by `user_id` at database level

---

## Validation Summary

### Client-Side Validation (Immediate Feedback)
- Title: required, 1-100 characters, non-empty
- Description: optional, max 1000 characters
- Task count: prevent creation if count >= 100

### Server-Side Validation (Security)
- Database constraints enforce data integrity
- RLS policies prevent unauthorized access
- Triggers enforce business rules (task limit)

### Error Handling
- Client displays inline validation errors
- Server errors (constraint violations) caught and displayed as user-friendly messages
- Offline operations blocked with clear indicator

---

## Future Considerations (Out of Scope for MVP)

- **Tags/Labels**: Add `tags` JSONB field for task categorization
- **Due Dates**: Add `due_date` TIMESTAMPTZ field for deadline tracking
- **Priority**: Add `priority` ENUM field (low/medium/high/urgent)
- **Attachments**: Add separate `attachments` table with foreign key to tasks
- **Comments**: Add `comments` table for task discussions
- **Archive**: Add `archived` BOOLEAN field instead of hard deletes
- **Multi-User Collaboration**: Add `shared_tasks` join table for team boards

These are deferred to maintain MVP simplicity and meet 100-task, single-user scope.
