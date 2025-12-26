# Implementation Plan: Task Board Application

**Branch**: `001-task-board` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-task-board/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Building a web-based Kanban task board application with drag-and-drop functionality for managing work tasks across three status columns (To Do, In Progress, Done). The application uses React with @dnd-kit for accessible drag interactions, Supabase for backend/auth/real-time sync, and Tailwind CSS for responsive design. Single-user focused with real-time multi-tab synchronization, read-only offline mode, and optimized for 100 tasks with 60 FPS drag performance.

## Technical Context

**Language/Version**: JavaScript ES6+, React 18.x, Node.js 18+ (for build tooling)  
**Primary Dependencies**: React, @dnd-kit/core, @dnd-kit/sortable, Tailwind CSS, Supabase JS Client  
**Storage**: Supabase (PostgreSQL) for persistent task data with real-time subscriptions  
**Testing**: React Testing Library + Jest (unit/integration), Playwright (E2E), axe-core (accessibility)  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 years)
**Project Type**: Web application (frontend + backend-as-a-service)  
**Performance Goals**: 60 FPS drag operations, <1s load time with 100 tasks, <3s initial page load on 3G  
**Constraints**: Read-only offline mode, 100 task limit per user, single card drag only, 200-300ms touch activation  
**Scale/Scope**: Single-user MVP with multi-user infrastructure (user ID scoped data), ~5-10 React components, 100 tasks max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Code Quality & Maintainability
- React component-based architecture promotes Single Responsibility
- Clear naming conventions (Task, Board, Column components)
- Public APIs documented via PropTypes/TypeScript interfaces
- Code reviews enforced via PR process
- Self-documenting component structure in `/frontend/src/components`

### ✅ Testing Standards (NON-NEGOTIABLE)
- **STATUS**: ✅ RESOLVED via Phase 0 research
- **TESTING STACK**: React Testing Library + Jest + Playwright + axe-core
- **COVERAGE TARGET**: 80% minimum (90% unit, 85% integration, 70% E2E)
- **TDD APPROACH**: Write tests first, implement to pass, refactor
- **TEST LAYERS**: Unit (utilities, hooks), Integration (components), E2E (workflows)
- **AUTOMATION**: Jest runs on every commit, Playwright in CI pipeline

### ✅ User Experience Consistency
- Design system via Tailwind CSS utility classes
- WCAG 2.1 Level AA compliance (keyboard nav via @dnd-kit, axe-core tests)
- Responsive design: 320px to 2560px viewports (tested across breakpoints)
- Immediate feedback: loading states, error messages, offline indicator
- Touch interaction: 200-300ms press-and-hold threshold (research validated)
- Consistent patterns: all forms use same validation, all errors display inline

### ✅ Performance Requirements
- **STATUS**: ✅ RESOLVED via Phase 0 research
- **MONITORING STACK**: Lighthouse CI + Web Vitals + Sentry Performance
- **TARGETS**: 60 FPS drag (Performance Observer), <1s load (Lighthouse), <3s TTI (Web Vitals)
- **BUDGETS**: <300KB bundle (gzipped), enforced in CI/CD pipeline
- **ALERTS**: Sentry alerts on frame drops >5%, Lighthouse CI fails on regressions
- **PROFILING**: Chrome DevTools Performance tab for drag operations

### Constitution Violations Requiring Justification
**NONE** - All principles satisfied:
- ✅ Code quality: Component-based architecture with clear separation
- ✅ Testing: 80%+ coverage with TDD approach, three test layers
- ✅ UX: WCAG 2.1 AA compliant, responsive, consistent patterns
- ✅ Performance: Monitoring stack defined, budgets enforced, targets measurable

**Post-Phase 1 Re-Check**: ✅ PASSED - Design artifacts align with all constitutional requirements.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-board/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── api.yaml         # OpenAPI/REST endpoints for task operations
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Board.jsx           # Main board container with columns
│   │   ├── Column.jsx          # Droppable column component
│   │   ├── TaskCard.jsx        # Draggable task card with truncation
│   │   ├── TaskForm.jsx        # Create/edit task modal/form
│   │   ├── OfflineIndicator.jsx # Network status banner
│   │   └── Layout.jsx          # Responsive layout wrapper
│   ├── hooks/
│   │   ├── useTasks.js         # Task CRUD + real-time sync
│   │   ├── useOfflineDetection.js # Network status monitoring
│   │   └── useDragState.js     # Drag queue management
│   ├── services/
│   │   ├── supabase.js         # Supabase client config
│   │   └── taskService.js      # Task API abstraction
│   ├── utils/
│   │   ├── truncate.js         # Text truncation utility
│   │   └── validation.js       # Input validation
│   ├── App.jsx                  # Root component with auth
│   └── index.js                 # Entry point
├── public/
│   └── index.html
└── tests/
    ├── unit/                    # Component unit tests
    ├── integration/             # Multi-component flows
    └── e2e/                     # Full user workflows

backend/
# Not applicable - using Supabase BaaS
# Database schema managed via Supabase migrations in:
migrations/
└── 001_create_tasks_table.sql   # PostgreSQL schema + RLS policies
```

**Structure Decision**: Web application (Option 2) with frontend-only implementation leveraging Supabase Backend-as-a-Service. No custom backend server needed. Database migrations stored in `/migrations` for version control of schema changes. This structure supports the single-user MVP with clear component separation and testing layers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** All constitution requirements align with the proposed architecture. Testing and monitoring strategy clarifications resolved in Phase 0 research.

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Application                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │    Auth     │  │    Board    │  │  Offline Mode   │   │  │
│  │  │  Component  │  │  Component  │  │    Detector     │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │  │
│  │         │                │                   │            │  │
│  │         └────────────────┼───────────────────┘            │  │
│  │                          │                                │  │
│  │  ┌───────────────────────▼────────────────────────────┐   │  │
│  │  │           Supabase JS Client Library               │   │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │  │
│  │  │  │ Auth Service │  │ REST API     │  │ Realtime │ │   │  │
│  │  │  │ (JWT tokens) │  │ (CRUD ops)   │  │ (WebSoc) │ │   │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────┘ │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼────────────────────────────────────┐
│                    Supabase Backend (BaaS)                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Auth Service  │  │  PostgreSQL DB │  │  Realtime Server │  │
│  │  (GoTrue)      │  │  (RLS enabled) │  │  (WebSocket pub) │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. **App Component** (Entry Point)
**Responsibilities**:
- Supabase auth initialization
- Route protection (redirect to login if not authenticated)
- Global error boundary
- App-level state management (React Context)

**Dependencies**: Supabase Auth, React Router (optional for future multi-page)

#### 2. **Board Component** (Main Container)
**Responsibilities**:
- Fetch tasks on mount (`useTasks` hook)
- Group tasks by status into columns
- Coordinate drag-and-drop context
- Handle task creation/edit/delete operations
- Display offline indicator

**Dependencies**: DndContext, useTasks, useOfflineDetection, Column, TaskForm

**State**:
```typescript
{
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
}
```

#### 3. **Column Component** (Droppable Zone)
**Responsibilities**:
- Render task cards for specific status
- Act as droppable zone for @dnd-kit
- Display empty state when no tasks
- Provide visual feedback during drag-over

**Props**:
```typescript
{
  status: 'todo' | 'in-progress' | 'done';
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}
```

#### 4. **TaskCard Component** (Draggable Item)
**Responsibilities**:
- Render task title and description (truncated)
- Act as draggable element
- Show full text on hover/click
- Provide edit/delete actions

**Props**:
```typescript
{
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  isDragging: boolean;
}
```

#### 5. **TaskForm Component** (Modal)
**Responsibilities**:
- Create or edit task
- Client-side validation
- Display validation errors
- Handle form submission

**Props**:
```typescript
{
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialTask?: Task;
  onSubmit: (task: TaskCreate | TaskUpdate) => Promise<void>;
  onClose: () => void;
}
```

#### 6. **OfflineIndicator Component** (Banner)
**Responsibilities**:
- Display offline status banner
- Show when network disconnected or Supabase unreachable

**Props**:
```typescript
{
  isOffline: boolean;
}
```

### Custom Hooks

#### `useTasks()`
**Purpose**: Manage task state with real-time sync

**Returns**:
```typescript
{
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  createTask: (data: TaskCreate) => Promise<Task>;
  updateTask: (id: string, data: TaskUpdate) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}
```

**Implementation**:
- Fetches tasks on mount
- Subscribes to Supabase real-time changes
- Optimistic UI updates with rollback on error
- Deduplicates real-time events (ignore own changes)

#### `useOfflineDetection()`
**Purpose**: Monitor network connectivity

**Returns**:
```typescript
{
  isOffline: boolean;
}
```

**Implementation**:
- Listens to `window.online/offline` events
- Monitors Supabase connection status via heartbeat channel
- Returns `true` if either network is down OR Supabase unreachable

#### `useDragState()`
**Purpose**: Manage drag operation queue

**Returns**:
```typescript
{
  isDragging: boolean;
  dragQueue: DragEvent[];
  startDrag: (event: DragEvent) => void;
  endDrag: () => void;
}
```

**Implementation**:
- Tracks active drag operation
- Queues subsequent drag attempts
- Processes queue after current drag completes
- Enforces single-card drag constraint

---

## Implementation Phases

### Phase 0: Research & Technical Decisions ✅ COMPLETE
**Duration**: 1-2 hours  
**Deliverables**: `research.md` with all technical decisions documented  
**Status**: All NEEDS CLARIFICATION items resolved

### Phase 1: Design & Contracts ✅ COMPLETE
**Duration**: 2-3 hours  
**Deliverables**:
- ✅ `data-model.md` - Database schema and entities
- ✅ `contracts/api.yaml` - REST API specification
- ✅ `quickstart.md` - Developer implementation guide
- ✅ Agent context updated with tech stack

**Status**: Design artifacts complete, ready for implementation

### Phase 2: Task Breakdown (Next Step - NOT DONE BY THIS COMMAND)
**Duration**: 1 hour  
**Command**: `/speckit.tasks` (separate command)  
**Deliverables**: `tasks.md` with prioritized implementation tasks

**This is where planning stops.** Implementation begins after task breakdown.

---

## Risk Assessment

### High Priority Risks

#### 1. **Drag Performance Degradation at 100 Tasks**
**Impact**: High - Core feature unusable if laggy  
**Probability**: Medium - @dnd-kit is optimized but 100 cards is edge case  
**Mitigation**:
- Implement virtual scrolling if initial testing shows issues
- Use GPU-accelerated transforms (CSS `transform` not `top/left`)
- Debounce real-time updates during drag
- Profile with Chrome DevTools Performance tab early

**Validation**: Load test with 100 tasks, measure FPS during drag with Performance Observer API

#### 2. **Supabase Real-Time Quota Limits**
**Impact**: Medium - Multi-tab sync breaks if quota exceeded  
**Probability**: Low - Free tier supports 2 concurrent connections  
**Mitigation**:
- Document quota limits in README
- Implement graceful degradation (polling fallback)
- Monitor connection count

**Validation**: Test with 3+ tabs open, verify connection pooling behavior

#### 3. **Touch Drag Conflicts with Scrolling**
**Impact**: High - Mobile UX broken if can't scroll  
**Probability**: Medium - Touch interactions are tricky  
**Mitigation**:
- Use 250ms press-and-hold activation delay (research validated)
- Add 5px tolerance for accidental movements
- Test on multiple real devices (iOS Safari, Android Chrome)

**Validation**: User testing with 5 mobile users, measure false positive/negative drag rates

#### 4. **Offline Mode State Inconsistency**
**Impact**: Medium - Data loss if modifications attempted offline  
**Probability**: Low - Modifications blocked in UI  
**Mitigation**:
- Double-check online status before all mutations
- Queue operations with retry logic (future enhancement)
- Clear offline indicator banner

**Validation**: E2E test simulating network disconnect mid-operation

### Medium Priority Risks

#### 5. **Task Limit Enforcement Bypassed**
**Impact**: Low - Performance degrades if >100 tasks created  
**Probability**: Low - Database trigger enforces limit  
**Mitigation**:
- Client-side pre-check before API call (better UX)
- Database trigger as final safety net
- Monitor task counts in production

**Validation**: Attempt to create 101st task, verify rejection

#### 6. **Real-Time Event Duplication**
**Impact**: Low - UI flickers with duplicate updates  
**Probability**: Medium - Common real-time sync issue  
**Mitigation**:
- Track transaction IDs to deduplicate events
- Suppress real-time updates in tab performing mutation

**Validation**: Update task in Tab A, verify Tab B receives single update

### Low Priority Risks

#### 7. **Browser Compatibility Issues**
**Impact**: Low - Some users on old browsers can't access app  
**Probability**: Low - Targeting last 2 years of browsers  
**Mitigation**:
- Test on all major browsers (Chrome, Firefox, Safari, Edge)
- Use browserslist config for proper transpilation
- Display unsupported browser message for IE

**Validation**: Manual testing on browser matrix

---

## Performance Targets & Monitoring

### Target Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Initial Load Time | <1s (100 tasks) | Lighthouse CI |
| Time to Interactive | <3s | Lighthouse CI, Web Vitals |
| Drag FPS | 60 FPS (no drops) | Performance Observer API |
| Bundle Size (gzipped) | <300KB | Webpack Bundle Analyzer |
| API Response Time (p95) | <500ms | Sentry Performance |
| Real-Time Sync Latency | <200ms | Custom instrumentation |
| Task Count Query | <50ms | Supabase Dashboard |

### Monitoring Strategy

**CI/CD Performance Gates**:
- Lighthouse CI runs on every PR
- Fails PR if bundle size exceeds 300KB or TTI >3s
- Performance budgets enforced automatically

**Production Monitoring**:
- Sentry Performance tracks drag operation timing
- Web Vitals reports Core Web Vitals to Sentry
- Supabase Dashboard monitors database query performance

**Alerting**:
- Sentry alert if drag frame drops >5% of operations
- Lighthouse CI fails if TTI regresses >10%

---

## Testing Strategy

### Test Coverage Goals

- **Unit Tests**: 90% coverage (utilities, hooks, services)
- **Integration Tests**: 85% coverage (component interactions)
- **E2E Tests**: 70% coverage (critical user paths)

### Test Pyramid

```
       /\
      /E2E\      10 tests - Full workflows (create→drag→delete)
     /─────\
    / INTEG \    20 tests - Component interactions, real-time sync
   /─────────\
  /   UNIT    \  50 tests - Utilities, hooks, validation, services
 /─────────────\
```

### Critical Test Scenarios

**Unit Tests**:
- Task validation (title required, length limits)
- Text truncation utility
- Drag queue management
- Offline detection logic

**Integration Tests**:
- Task creation updates board state
- Drag-and-drop updates task status
- Real-time sync propagates changes
- Offline mode disables mutations

**E2E Tests** (Playwright):
1. User sign-up and login
2. Create task → appears in todo column
3. Drag task from todo → in-progress → done
4. Edit task title and description
5. Delete task with confirmation
6. Multi-tab sync (change in Tab A appears in Tab B)
7. Offline mode (go offline, verify read-only)
8. Task limit (create 100 tasks, 101st fails)
9. Touch drag on mobile viewport
10. Responsive layout (test 320px, 768px, 1920px)

### TDD Workflow

1. Write failing test for new feature
2. Implement minimal code to pass test
3. Refactor while keeping tests green
4. Verify code coverage increased
5. Run full test suite before commit

---

## Accessibility Compliance (WCAG 2.1 Level AA)

### Keyboard Navigation
- Tab through all interactive elements (cards, buttons, forms)
- Spacebar/Enter to activate drag mode
- Arrow keys to move card during drag
- Escape to cancel drag operation

### Screen Reader Support
- Semantic HTML (`<main>`, `<section>`, `<article>`)
- ARIA labels on drag zones
- Live region announcements for drag operations
- Alt text for all icons

### Visual Accessibility
- Color contrast ratio ≥4.5:1 (text), ≥3:1 (large text)
- Focus indicators visible on all elements
- No color-only indicators (status uses icon + color)
- Text resizing up to 200% without loss of functionality

### Testing Tools
- axe-core automated accessibility tests in Jest
- Lighthouse accessibility audits in CI
- Manual testing with NVDA (Windows) and VoiceOver (Mac)

---

## Security Considerations

### Authentication & Authorization
- Supabase Auth handles JWT token management
- Row Level Security (RLS) enforces user-scoped data access
- All API calls include auth token in Authorization header
- Tokens auto-refresh before expiration

### Data Validation
- Client-side validation for UX (immediate feedback)
- Server-side validation enforces security (database constraints)
- SQL injection prevented via parameterized queries (Supabase handles)
- XSS prevented via React's built-in escaping

### Network Security
- HTTPS enforced for all API calls (Supabase default)
- WebSocket connections use WSS (secure)
- No sensitive data in localStorage (only JWT token)

---

## Future Enhancements (Out of Scope for MVP)

### Post-MVP Features (Deferred)
1. **Task Tags/Labels** - Categorize tasks with custom tags
2. **Due Dates & Reminders** - Set deadlines and get notifications
3. **Task Priority** - High/Medium/Low priority indicators
4. **Search & Filters** - Find tasks by title, description, status
5. **Task Archive** - Soft delete instead of hard delete
6. **Bulk Operations** - Multi-select for batch status updates
7. **Undo/Redo** - Rollback accidental changes
8. **Keyboard Shortcuts** - Power user features (Cmd+K command palette)
9. **Dark Mode** - Theme toggle for low-light environments
10. **Collaboration** - Share boards with team members

### Scalability Considerations
- Current architecture supports 100 tasks/user
- For >100 tasks: implement virtual scrolling (react-window)
- For multi-user: add team/organization entity, shared boards table
- For large teams: migrate to dedicated backend (Supabase scales to ~10k users)

---

## Definition of Done

### Phase 1 (Design) - ✅ COMPLETE
- [x] Research document with all technical decisions
- [x] Data model with database schema
- [x] API contracts (OpenAPI spec)
- [x] Quick start guide for developers
- [x] Agent context updated

### Phase 2 (Task Breakdown) - NEXT STEP
- [ ] Tasks document with prioritized work items
- [ ] Time estimates for each task
- [ ] Task dependencies identified

### Implementation (Future)
- [ ] All functional requirements implemented
- [ ] 80% code coverage achieved
- [ ] All E2E tests passing
- [ ] Performance targets met (Lighthouse CI green)
- [ ] Accessibility audit passing (axe-core)
- [ ] Manual testing on 3+ devices
- [ ] User acceptance testing complete
- [ ] Documentation updated (README, deployment guide)

---

## Summary & Next Steps

### What Was Accomplished
✅ **Phase 0 Complete**: All technical unknowns researched and resolved  
✅ **Phase 1 Complete**: Comprehensive design artifacts generated
- Architecture design with component breakdown
- Data model with PostgreSQL schema
- REST API contracts (OpenAPI)
- Developer quick start guide
- Risk assessment and mitigation strategies
- Testing strategy with coverage goals
- Performance targets and monitoring plan

### Generated Artifacts
1. `research.md` - 7 technical decisions documented with rationale
2. `data-model.md` - Database schema, entities, validation rules
3. `contracts/api.yaml` - REST API specification (OpenAPI 3.0)
4. `quickstart.md` - Step-by-step implementation guide
5. `plan.md` - This comprehensive implementation plan (updated)
6. `.github/agents/copilot-instructions.md` - Agent context updated

### Next Steps
1. **Run `/speckit.tasks` command** to generate task breakdown (`tasks.md`)
2. **Begin implementation** following the quick start guide
3. **Follow TDD approach** - write tests first
4. **Track progress** against task breakdown
5. **Monitor performance** via Lighthouse CI and Sentry

### Key Decisions Locked In
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Drag Library**: @dnd-kit with 250ms touch activation
- **Backend**: Supabase (Auth + PostgreSQL + Real-Time)
- **Testing**: React Testing Library + Jest + Playwright
- **Monitoring**: Lighthouse CI + Web Vitals + Sentry
- **Architecture**: Frontend-only with BaaS (no custom backend)

**Implementation is ready to begin.** All ambiguities resolved, all design decisions documented.
