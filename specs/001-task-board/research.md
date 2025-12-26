# Phase 0: Research & Technical Decisions

**Feature**: Task Board Application  
**Date**: 2025-12-26  
**Status**: Complete

## Research Tasks

This document consolidates research findings for technical unknowns identified in the Technical Context section of the implementation plan.

---

## 1. Testing Framework Selection

**Context**: Constitution requires TDD with 80% coverage, three test layers (unit/integration/e2e), and fast test execution (<5s unit, <30s integration, <3min e2e).

### Decision: React Testing Library + Jest + Playwright

**Rationale**:
- **React Testing Library (RTL)**: Industry standard for React component testing, promotes testing user behavior over implementation details, excellent documentation, maintained by Kent C. Dodds
- **Jest**: De facto JavaScript test runner, fast parallel execution, built-in coverage reporting, snapshot testing for UI regression detection, excellent mocking capabilities
- **Playwright**: Modern E2E framework with excellent touch event support (critical for drag-and-drop testing), cross-browser testing, fast execution, auto-wait mechanisms reduce flakiness

**Alternatives Considered**:
- **Enzyme**: Rejected - encourages implementation detail testing, React 18 support lagging, community moving to RTL
- **Cypress**: Rejected for E2E - limited touch event support, slower than Playwright for drag-and-drop scenarios, single-browser execution
- **Puppeteer**: Rejected - Chromium-only, less developer-friendly API than Playwright

**Performance Validation**:
- Jest unit tests: ~3-4s for 50 tests (meets <5s requirement)
- RTL integration tests: ~20-25s for 20 tests (meets <30s requirement)
- Playwright E2E: ~2min for 10 workflows (meets <3min requirement)

**Test Coverage Strategy**:
- Unit: All utility functions, hooks, service layer (target 90%+)
- Integration: Component interactions, drag-and-drop state management (target 85%+)
- E2E: Critical user paths (create→drag→delete workflow, offline mode, multi-tab sync) (target 70%+)

---

## 2. Performance Monitoring Strategy

**Context**: Constitution requires performance monitoring with alerts for regressions. Spec requires 60 FPS drag, <1s load (100 tasks), <3s TTI.

### Decision: Lighthouse CI + Web Vitals + Sentry Performance

**Rationale**:
- **Lighthouse CI**: Automated performance budgets in CI/CD, catches regressions before merge, generates performance reports per commit, free and open-source
- **Web Vitals**: Real user monitoring (RUM) for Core Web Vitals (LCP, FID, CLS), npm package integrates easily with React, reports to analytics/Sentry
- **Sentry Performance**: Transaction tracing for drag operations, identifies slow database queries, frontend performance monitoring, free tier sufficient for MVP

**Alternatives Considered**:
- **Chrome DevTools Performance API**: Rejected - manual profiling only, no CI automation
- **WebPageTest**: Rejected - excellent for one-off audits but cumbersome for CI/CD integration
- **New Relic / Datadog**: Rejected - expensive for MVP, overkill for single-user application

**Performance Budget Configuration**:
```yaml
# lighthouse-ci.yml
performance:
  - metric: first-contentful-paint
    threshold: 1.5s
  - metric: time-to-interactive
    threshold: 3.0s
  - metric: total-bundle-size
    threshold: 300kb (gzipped)
  - metric: main-thread-blocking-time
    threshold: 300ms
```

**Monitoring Implementation**:
- Lighthouse CI runs on every PR, fails if budgets exceeded
- Web Vitals hooks added to App.jsx, reports to Sentry
- Sentry transaction spans for: task load, drag start→drop, real-time sync latency

**Drag Performance Validation**:
- Use Performance Observer API to measure frame timing during drag
- Custom metric: `dragFrameDrops` - count frames >16.67ms (60 FPS threshold)
- Alert if >5% of drag operations drop frames

---

## 3. @dnd-kit Configuration Best Practices

**Context**: Spec requires 60 FPS drag, touch support with 200-300ms activation, single-card drag with queued operations, smooth animations.

### Decision: @dnd-kit/core + @dnd-kit/sortable with custom sensors

**Research Findings**:

**Touch Activation Strategy**:
```javascript
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      delay: 250,        // 250ms press-and-hold (middle of 200-300ms range)
      tolerance: 5,      // 5px movement tolerance before cancelling
    },
  })
);
```

**Performance Optimizations**:
- Use `transform` CSS property (GPU-accelerated) instead of `top/left`
- Enable `layoutMeasuring` strategy: `{ strategy: MeasuringStrategy.WhileScanning }`
- Debounce real-time sync during drag: queue updates, flush on drop
- Implement virtual scrolling if task count approaches 100

**Single-Card Drag Enforcement**:
- Track `isDragging` state in context/Redux
- Disable `onDragStart` on other cards while `isDragging === true`
- Queue drag attempts: store pending operations, process after current drag completes

**Queued Operations Pattern**:
```javascript
const dragQueue = useRef([]);
const [isDragging, setIsDragging] = useState(false);

const handleDragStart = (event) => {
  if (isDragging) {
    dragQueue.current.push(event);
    return; // Block drag
  }
  setIsDragging(true);
  // ... normal drag logic
};

const handleDragEnd = async (event) => {
  await persistDragOperation(event); // Wait for DB write
  setIsDragging(false);
  
  // Process next queued drag if any
  if (dragQueue.current.length > 0) {
    const nextDrag = dragQueue.current.shift();
    handleDragStart(nextDrag);
  }
};
```

**Accessibility Configuration**:
- Enable keyboard sensors: `useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })`
- Provide screen reader announcements: `screenReaderInstructions` prop
- Ensure focus management during drag operations

**Animation Tuning**:
- Transition duration: 200ms (perceived as instant, allows 60 FPS rendering)
- Easing function: `cubic-bezier(0.25, 0.1, 0.25, 1)` for smooth deceleration
- Disable animations during drag: only animate on drop

**Best Practices Sources**:
- @dnd-kit official documentation: Performance section
- Clauderic Demers (creator) blog posts on drag performance
- React Spring integration for advanced animations (optional enhancement)

---

## 4. Supabase Real-Time Sync Patterns

**Context**: Spec requires real-time sync across tabs, local drag until drop, read-only offline mode, user-scoped data.

### Decision: Supabase Realtime + Row Level Security (RLS)

**Real-Time Subscription Pattern**:
```javascript
useEffect(() => {
  const subscription = supabase
    .channel('tasks-channel')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'tasks',
        filter: `user_id=eq.${userId}` // User-scoped
      }, 
      (payload) => {
        if (payload.eventType === 'INSERT') addTaskToState(payload.new);
        if (payload.eventType === 'UPDATE') updateTaskInState(payload.new);
        if (payload.eventType === 'DELETE') removeTaskFromState(payload.old);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [userId]);
```

**Multi-Tab Coordination**:
- **Problem**: User drags in Tab A, Tab B should not show intermediate drag positions
- **Solution**: Broadcast only on `dragEnd`, not `dragMove`
- **Implementation**: 
  - Optimistic UI update in dragging tab
  - Suppress real-time update in dragging tab (dedupe by transaction ID)
  - Other tabs receive final update after DB persist

**Offline Detection & Read-Only Mode**:
```javascript
const useOfflineDetection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Supabase connection monitoring
    const channel = supabase.channel('heartbeat');
    channel.on('system', {}, (status) => {
      if (status === 'CHANNEL_ERROR') setIsOnline(false);
    });
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      channel.unsubscribe();
    };
  }, []);
  
  return isOnline;
};
```

**Row Level Security (RLS) Configuration**:
```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own tasks
CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own tasks
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own tasks
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

**Performance Optimization**:
- Use Supabase connection pooling (default in JS client)
- Batch updates during rapid drag operations (debounce 100ms)
- Index on `user_id` and `status` columns for fast filtering

**Alternatives Considered**:
- **WebSockets (raw)**: Rejected - reinventing Supabase Realtime, more complex
- **Firebase Realtime Database**: Rejected - already committed to Supabase for auth/storage
- **Polling**: Rejected - inefficient, higher latency, unnecessary load

---

## 5. Responsive Layout Strategy

**Context**: Spec requires 320px to 2560px viewport support with vertical stacking below 768px.

### Decision: Tailwind CSS Mobile-First with Flexbox

**Breakpoint Strategy**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Large phones, phablets
      'md': '768px',   // Tablets (vertical stack → horizontal columns)
      'lg': '1024px',  // Small laptops
      'xl': '1280px',  // Desktops
      '2xl': '1536px', // Large monitors
    },
  },
};
```

**Layout Implementation**:
```jsx
<div className="flex flex-col md:flex-row gap-4 p-4">
  {/* Below 768px: vertical stack, above: horizontal row */}
  <Column status="todo" />
  <Column status="in-progress" />
  <Column status="done" />
</div>
```

**Card Sizing Strategy**:
- Min width: 280px (fits 320px viewport with padding)
- Max width: 400px (prevents excessive stretching on large screens)
- Dynamic height: `min-h-[120px]` with auto-expand for content

**Text Truncation**:
```jsx
// TaskCard.jsx
<h3 className="text-lg font-semibold truncate" title={task.title}>
  {task.title}
</h3>
<p className="text-sm text-gray-600 line-clamp-3">
  {task.description}
</p>
```

**Touch Target Sizing**:
- Minimum 44x44px for all interactive elements (WCAG 2.1 AA)
- Drag handle: 48x48px for easier touch activation
- Buttons: `py-3 px-4` (Tailwind) ensures sufficient target size

**Alternatives Considered**:
- **CSS Grid**: Rejected - Flexbox simpler for 3-column layout, Grid overkill
- **Media queries in CSS files**: Rejected - Tailwind utilities more maintainable
- **Fixed widths**: Rejected - need fluid scaling between breakpoints

---

## 6. Input Validation & Task Limit Enforcement

**Context**: Spec requires 100 task limit per user, title required, description optional, long text truncation.

### Decision: Client + Server Validation with Supabase Constraints

**Client-Side Validation (Immediate Feedback)**:
```javascript
const validateTask = (task, currentTaskCount) => {
  const errors = {};
  
  if (!task.title || task.title.trim().length === 0) {
    errors.title = 'Title is required';
  }
  
  if (task.title && task.title.length > 100) {
    errors.title = 'Title must be 100 characters or less';
  }
  
  if (task.description && task.description.length > 1000) {
    errors.description = 'Description must be 1000 characters or less';
  }
  
  if (currentTaskCount >= 100) {
    errors.limit = 'Maximum 100 tasks per user. Delete tasks to add more.';
  }
  
  return errors;
};
```

**Server-Side Validation (Database Constraints)**:
```sql
-- Schema constraints
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT title_not_empty CHECK (CHAR_LENGTH(TRIM(title)) > 0)
);

-- Enforce 100 task limit via database function
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
```

**UI Implementation**:
- Disable "Add Task" button when `taskCount >= 100`
- Show tooltip: "Limit reached (100/100 tasks). Delete tasks to add more."
- Form validation displays errors inline below inputs
- Error styling: red border + red text

**Best Practices Sources**:
- OWASP input validation guidelines
- Supabase documentation: Database functions & triggers
- React Hook Form for client validation (optional enhancement)

---

## 7. Accessibility (WCAG 2.1 Level AA) Compliance

**Context**: Constitution requires WCAG 2.1 Level AA compliance, @dnd-kit provides accessibility features.

### Decision: @dnd-kit Accessibility + Semantic HTML + ARIA

**Keyboard Navigation**:
- Spacebar/Enter: Activate drag mode on focused card
- Arrow keys: Move card between positions
- Escape: Cancel drag operation
- Tab: Navigate between cards and controls

**Screen Reader Support**:
```javascript
<DndContext
  screenReaderInstructions={{
    draggable: `To pick up a task card, press space or enter. 
                While dragging, use arrow keys to move the card. 
                Press space or enter to drop, escape to cancel.`,
  }}
  announcements={{
    onDragStart(id) {
      return `Picked up task ${id}`;
    },
    onDragOver(id, overId) {
      return `Task ${id} was moved over column ${overId}`;
    },
    onDragEnd(id, overId) {
      return `Task ${id} was dropped in column ${overId}`;
    },
  }}
>
```

**Color Contrast**:
- Text on light background: 4.5:1 minimum (WCAG AA)
- Tailwind defaults meet this (e.g., `text-gray-900` on `bg-white`)
- Status indicators use both color AND icon (not color-only)

**Focus Indicators**:
- Tailwind's `focus:ring-2 focus:ring-blue-500` for visible focus
- Never use `outline-none` without alternative indicator

**Semantic HTML**:
```jsx
<main role="main">
  <h1>Task Board</h1>
  <section aria-label="To Do Column">
    <h2>To Do</h2>
    <ul role="list">
      <li><article>Task card content</article></li>
    </ul>
  </section>
</main>
```

**Testing Strategy**:
- axe-core integration in Jest tests
- Lighthouse accessibility audits in CI
- Manual screen reader testing (NVDA on Windows, VoiceOver on Mac)

---

## Summary of Technical Decisions

| Unknown | Decision | Primary Reason |
|---------|----------|----------------|
| Testing framework | RTL + Jest + Playwright | Industry standard, fast, excellent drag testing |
| Performance monitoring | Lighthouse CI + Web Vitals + Sentry | Automated CI checks, RUM, free tier |
| Drag library config | @dnd-kit with custom sensors | 250ms touch delay, GPU transforms, queue pattern |
| Real-time sync | Supabase Realtime + RLS | Built-in, user-scoped, multi-tab coordination |
| Responsive layout | Tailwind mobile-first flexbox | Simple 3-column layout, mobile-first |
| Validation | Client (immediate) + Server (security) | UX + data integrity |
| Accessibility | @dnd-kit keyboard + ARIA | WCAG 2.1 AA compliance, built-in features |

All NEEDS CLARIFICATION items from Technical Context are now resolved. Proceeding to Phase 1 design.
