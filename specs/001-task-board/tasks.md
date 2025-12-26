---
description: "Actionable task breakdown for Task Board Application implementation"
---

# Tasks: Task Board Application

**Input**: Design documents from `/specs/001-task-board/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml, quickstart.md

**Tests**: Tests are included per TDD approach requirement from plan.md (80% coverage target: 90% unit, 85% integration, 70% E2E).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Tests**: `frontend/tests/`
- **Database migrations**: `migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize React project with Vite in frontend/ directory
- [X] T002 Install core dependencies: @supabase/supabase-js, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- [X] T003 [P] Install and configure Tailwind CSS with PostCSS in frontend/
- [X] T004 [P] Install testing dependencies: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
- [X] T005 [P] Install E2E testing: @playwright/test
- [X] T006 [P] Install accessibility testing: axe-core, vitest-axe
- [X] T007 Configure Tailwind CSS in frontend/tailwind.config.js with breakpoints (sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px)
- [X] T008 [P] Add Tailwind directives to frontend/src/index.css
- [X] T009 [P] Configure Vitest in frontend/vitest.config.js with jsdom environment
- [X] T010 [P] Configure Playwright in frontend/playwright.config.js with chromium/firefox/webkit browsers
- [X] T011 [P] Create frontend/.env.local template file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- [X] T012 [P] Setup project structure: create directories frontend/src/components/, frontend/src/hooks/, frontend/src/services/, frontend/src/utils/
- [X] T013 [P] Create test directories: frontend/tests/unit/, frontend/tests/integration/, frontend/tests/e2e/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T014 Create Supabase project and note project URL and anon key (MANUAL - User must create Supabase project)
- [X] T015 Run database migration script in migrations/001_create_tasks_table.sql to create tasks table with constraints, indexes, RLS policies, triggers
- [ ] T016 Enable real-time for tasks table in Supabase Dashboard (ALTER PUBLICATION supabase_realtime ADD TABLE tasks) (MANUAL)
- [ ] T017 Enable email authentication in Supabase Dashboard and disable email confirmations for development (MANUAL)
- [X] T018 Create Supabase client configuration in frontend/src/services/supabase.js with environment variables
- [X] T019 [P] Create task service abstraction in frontend/src/services/taskService.js with getTasks(), createTask(), updateTask(), deleteTask() methods
- [X] T020 [P] Create text truncation utility in frontend/src/utils/truncate.js for title/description ellipsis
- [X] T021 [P] Create validation utility in frontend/src/utils/validation.js for title/description constraints
- [X] T022 Create authentication wrapper component in frontend/src/App.jsx with Supabase Auth UI for email/password login
- [ ] T023 Setup Lighthouse CI configuration in .github/workflows/lighthouse-ci.yml with performance budgets (<1s load, <3s TTI, <300KB bundle)
- [ ] T024 [P] Setup Sentry Performance monitoring initialization in frontend/src/index.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can create, view, edit, and delete task cards in a visual format

**Independent Test**: Create multiple task cards with titles and descriptions, view them in a tile layout, edit and delete tasks. Delivers a functional task list application even without drag-and-drop.

### Tests for User Story 1 (TDD Approach - Write FIRST)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T025 [P] [US1] Unit test for task validation utility in frontend/tests/unit/validation.test.js (title required, length limits)
- [X] T026 [P] [US1] Unit test for text truncation utility in frontend/tests/unit/truncate.test.js (ellipsis at 100 chars)
- [ ] T027 [P] [US1] Unit test for taskService.getTasks() in frontend/tests/unit/taskService.test.js (mock Supabase response)
- [ ] T028 [P] [US1] Unit test for taskService.createTask() in frontend/tests/unit/taskService.test.js (validates input, returns created task)
- [ ] T029 [P] [US1] Unit test for taskService.updateTask() in frontend/tests/unit/taskService.test.js (updates specific fields)
- [ ] T030 [P] [US1] Unit test for taskService.deleteTask() in frontend/tests/unit/taskService.test.js (removes task by ID)
- [ ] T031 [P] [US1] Integration test for TaskCard component in frontend/tests/integration/TaskCard.test.jsx (renders title/description, shows truncated text)
- [ ] T032 [P] [US1] Integration test for TaskForm component in frontend/tests/integration/TaskForm.test.jsx (validates input, submits data)
- [ ] T033 [P] [US1] Integration test for Board component task loading in frontend/tests/integration/Board.test.jsx (fetches and displays tasks)
- [ ] T034 [US1] E2E test for task creation workflow in frontend/tests/e2e/task-crud.spec.js (sign in → create task → verify display)
- [ ] T035 [US1] E2E test for task editing workflow in frontend/tests/e2e/task-crud.spec.js (edit task → verify updated content)
- [ ] T036 [US1] E2E test for task deletion workflow in frontend/tests/e2e/task-crud.spec.js (delete task → verify removed from board)

### Implementation for User Story 1

- [X] T037 [P] [US1] Create Column component in frontend/src/components/Column.jsx with status prop, renders task list container
- [X] T038 [P] [US1] Create TaskCard component in frontend/src/components/TaskCard.jsx with truncated title/description, edit/delete buttons
- [X] T039 [P] [US1] Create TaskForm modal component in frontend/src/components/TaskForm.jsx for create/edit operations with validation
- [X] T040 [US1] Create useTasks hook in frontend/src/hooks/useTasks.js with state management (tasks, loading, error) and CRUD operations
- [X] T041 [US1] Create Board component in frontend/src/components/Board.jsx that fetches tasks, groups by status, renders 3 columns
- [X] T042 [US1] Add responsive layout to Board component in frontend/src/components/Board.jsx (flexbox, vertical stack <768px)
- [X] T043 [US1] Add task creation UI to Board component in frontend/src/components/Board.jsx (Add Task button opens TaskForm)
- [X] T044 [US1] Implement edit task flow in TaskCard component in frontend/src/components/TaskCard.jsx (edit button → opens TaskForm)
- [X] T045 [US1] Implement delete task flow with confirmation in TaskCard component in frontend/src/components/TaskCard.jsx
- [X] T046 [US1] Add loading states and error handling to Board component in frontend/src/components/Board.jsx
- [X] T047 [US1] Add hover tooltips for full text on truncated titles/descriptions in TaskCard component in frontend/src/components/TaskCard.jsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Run all tests (T025-T036) to verify implementation.

---

## Phase 4: User Story 2 - Drag-and-Drop Status Updates (Priority: P2)

**Goal**: Users can drag task cards between status columns to quickly update progress

**Independent Test**: Create tasks and drag them between "To Do", "In Progress", and "Done" columns. Verify status updates automatically. Delivers the key workflow management capability.

### Tests for User Story 2 (TDD Approach - Write FIRST)

- [ ] T048 [P] [US2] Unit test for useDragState hook in frontend/tests/unit/useDragState.test.js (tracks isDragging, queues operations)
- [ ] T049 [P] [US2] Unit test for drag queue management in frontend/tests/unit/useDragState.test.js (blocks concurrent drags, processes queue)
- [ ] T050 [P] [US2] Integration test for drag-and-drop status change in frontend/tests/integration/Board-drag.test.jsx (simulate drag event, verify status update)
- [ ] T051 [P] [US2] Integration test for drag cancellation in frontend/tests/integration/Board-drag.test.jsx (drag outside valid zone, card returns to origin)
- [ ] T052 [P] [US2] Integration test for touch drag activation in frontend/tests/integration/Board-drag.test.jsx (250ms delay, 5px tolerance)
- [ ] T053 [US2] E2E test for drag workflow in frontend/tests/e2e/drag-drop.spec.js (drag from todo → in-progress → done)
- [ ] T054 [US2] E2E test for touch drag on mobile viewport in frontend/tests/e2e/drag-drop.spec.js (simulate touch events)
- [ ] T055 [US2] E2E test for rapid drag operations in frontend/tests/e2e/drag-drop.spec.js (queue validation)

### Implementation for User Story 2

- [X] T056 [P] [US2] Create useDragState hook in frontend/src/hooks/useDragState.js with isDragging state and drag queue management
- [X] T057 [US2] Configure @dnd-kit sensors in Board component in frontend/src/components/Board.jsx (PointerSensor with 250ms delay, 5px tolerance)
- [X] T058 [US2] Wrap Board with DndContext in frontend/src/components/Board.jsx and implement handleDragStart
- [X] T059 [US2] Make Column component droppable in frontend/src/components/Column.jsx using useDroppable hook
- [X] T060 [US2] Make TaskCard draggable in frontend/src/components/TaskCard.jsx using useDraggable hook
- [X] T061 [US2] Implement handleDragEnd in Board component in frontend/src/components/Board.jsx with optimistic UI update and rollback on error
- [X] T062 [US2] Add visual drag feedback in TaskCard component in frontend/src/components/TaskCard.jsx (transform, opacity, CSS transitions)
- [X] T063 [US2] Add drop zone visual feedback in Column component in frontend/src/components/Column.jsx (border highlight on drag-over)
- [X] T064 [US2] Implement drag queue processing in useDragState hook in frontend/src/hooks/useDragState.js (process next after current completes)
- [ ] T065 [US2] Add keyboard navigation support in Board component in frontend/src/components/Board.jsx (spacebar/enter to activate, arrow keys to move)
- [ ] T066 [US2] Add screen reader announcements in Board component in frontend/src/components/Board.jsx (DndContext announcements prop)
- [ ] T067 [US2] Add ARIA labels and semantic HTML to drag components in frontend/src/components/Column.jsx and TaskCard.jsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Drag-and-drop transforms the task list into a Kanban board. Run all tests (T025-T055) to verify.

---

## Phase 5: User Story 3 - Responsive Multi-Device Access (Priority: P3)

**Goal**: Users can access and use the task board on any device (desktop, tablet, mobile) with appropriate layout adaptation

**Independent Test**: Access application on different screen sizes and devices, verify layout adapts and all interactions work correctly. Delivers complete multi-device experience.

### Tests for User Story 3 (TDD Approach - Write FIRST)

- [ ] T068 [P] [US3] Integration test for mobile layout in frontend/tests/integration/Board-responsive.test.jsx (320px viewport, vertical column stack)
- [ ] T069 [P] [US3] Integration test for tablet layout in frontend/tests/integration/Board-responsive.test.jsx (768px viewport, horizontal columns)
- [ ] T070 [P] [US3] Integration test for desktop layout in frontend/tests/integration/Board-responsive.test.jsx (1920px viewport, scaled columns)
- [ ] T071 [P] [US3] Integration test for touch target sizing in frontend/tests/integration/TaskCard-responsive.test.jsx (44x44px minimum)
- [ ] T072 [US3] E2E test for responsive breakpoints in frontend/tests/e2e/responsive.spec.js (test 320px, 768px, 1024px, 1920px)
- [ ] T073 [US3] E2E test for device rotation in frontend/tests/e2e/responsive.spec.js (portrait → landscape, layout adjusts)
- [ ] T074 [US3] E2E test for touch interactions on mobile in frontend/tests/e2e/responsive.spec.js (tap, scroll, drag)

### Implementation for User Story 3

- [ ] T075 [P] [US3] Add mobile-first responsive classes to Board component in frontend/src/components/Board.jsx (flex-col md:flex-row)
- [ ] T076 [P] [US3] Add responsive card sizing to TaskCard component in frontend/src/components/TaskCard.jsx (min-w-[280px] max-w-[400px])
- [ ] T077 [P] [US3] Add responsive padding/spacing to Column component in frontend/src/components/Column.jsx (gap-2 md:gap-4)
- [ ] T078 [P] [US3] Ensure touch target sizing in TaskCard component in frontend/src/components/TaskCard.jsx (buttons py-3 px-4, drag handle 48x48px)
- [ ] T079 [US3] Test and adjust layout on mobile devices (320px-767px) - verify vertical stack, scrollability
- [ ] T080 [US3] Test and adjust layout on tablets (768px-1023px) - verify horizontal columns, appropriate spacing
- [ ] T081 [US3] Test and adjust layout on desktop (1024px+) - verify no excessive whitespace, optimal column width
- [ ] T082 [US3] Add viewport meta tag to frontend/index.html for proper mobile rendering
- [ ] T083 [US3] Test touch drag interactions on real iOS and Android devices, adjust activation delay if needed

**Checkpoint**: All user stories should now be independently functional across all device sizes. Run all tests (T025-T074) to verify complete implementation.

---

## Phase 6: Real-Time Sync & Offline Mode

**Purpose**: Enable multi-tab synchronization and graceful offline handling (cross-cutting concerns affecting all user stories)

### Tests for Real-Time & Offline (Write FIRST)

- [ ] T084 [P] Unit test for useOfflineDetection hook in frontend/tests/unit/useOfflineDetection.test.js (detects navigator.onLine changes)
- [ ] T085 [P] Unit test for real-time subscription in frontend/tests/unit/useTasks.test.js (handles INSERT/UPDATE/DELETE events)
- [ ] T086 [P] Integration test for multi-tab sync in frontend/tests/integration/Board-realtime.test.jsx (mock real-time events, verify state updates)
- [ ] T087 [P] Integration test for offline indicator display in frontend/tests/integration/OfflineIndicator.test.jsx (shows banner when offline)
- [ ] T088 [P] Integration test for disabled mutations when offline in frontend/tests/integration/Board-offline.test.jsx (buttons disabled, drag blocked)
- [ ] T089 E2E test for multi-tab synchronization in frontend/tests/e2e/realtime.spec.js (change in Tab A appears in Tab B)
- [ ] T090 E2E test for offline mode in frontend/tests/e2e/offline.spec.js (disconnect network, verify read-only mode)

### Implementation for Real-Time & Offline

- [X] T091 [P] Create useOfflineDetection hook in frontend/src/hooks/useOfflineDetection.js monitoring navigator.onLine and Supabase connection
- [X] T092 [P] Create OfflineIndicator component in frontend/src/components/OfflineIndicator.jsx with banner UI
- [X] T093 Add real-time subscription to useTasks hook in frontend/src/hooks/useTasks.js (subscribe to tasks table changes filtered by user_id)
- [X] T094 Implement real-time event handlers in useTasks hook in frontend/src/hooks/useTasks.js (INSERT adds task, UPDATE modifies, DELETE removes)
- [ ] T095 Add deduplication logic in useTasks hook in frontend/src/hooks/useTasks.js (suppress own updates during mutations)
- [X] T096 Integrate useOfflineDetection into Board component in frontend/src/components/Board.jsx
- [X] T097 Add OfflineIndicator to Board component in frontend/src/components/Board.jsx (display when offline)
- [X] T098 Disable mutations when offline in Board component in frontend/src/components/Board.jsx (disable Add Task button, edit/delete buttons)
- [X] T099 Disable drag-and-drop when offline in Board component in frontend/src/components/Board.jsx (prevent drag activation)
- [ ] T100 Add pre-flight online check before all mutations in taskService in frontend/src/services/taskService.js
- [ ] T101 Test multi-tab sync behavior with 2 browser tabs open, verify real-time updates work correctly

**Checkpoint**: Real-time synchronization and offline mode complete. Test with multiple tabs and simulated network disconnect.

---

## Phase 7: Task Limit & Performance Optimization

**Purpose**: Enforce 100-task limit and ensure performance targets are met (60 FPS drag, <1s load time)

### Tests for Task Limit & Performance (Write FIRST)

- [ ] T102 [P] Unit test for task count check in frontend/tests/unit/validation.test.js (returns error if count >= 100)
- [ ] T103 [P] Integration test for task limit UI in frontend/tests/integration/Board-limit.test.jsx (Add Task button disabled at 100 tasks)
- [ ] T104 E2E test for task limit enforcement in frontend/tests/e2e/task-limit.spec.js (create 100 tasks, 101st fails with message)
- [ ] T105 E2E test for performance metrics in frontend/tests/e2e/performance.spec.js (load 100 tasks, measure load time <1s)

### Implementation for Task Limit & Performance

- [X] T106 Add task count tracking to useTasks hook in frontend/src/hooks/useTasks.js (update on create/delete)
- [X] T107 Implement task count check in Board component in frontend/src/components/Board.jsx (disable Add Task button if count >= 100)
- [X] T108 Add tooltip to disabled Add Task button in Board component in frontend/src/components/Board.jsx (explain 100-task limit)
- [ ] T109 Add client-side pre-check in taskService.createTask() in frontend/src/services/taskService.js (fail fast if limit reached)
- [ ] T110 Add Performance Observer API instrumentation in Board component in frontend/src/components/Board.jsx (measure drag FPS)
- [ ] T111 Optimize re-renders with React.memo on TaskCard component in frontend/src/components/TaskCard.jsx
- [ ] T112 Optimize re-renders with React.memo on Column component in frontend/src/components/Column.jsx
- [ ] T113 Add CSS transform optimization for drag operations in TaskCard component in frontend/src/components/TaskCard.jsx (GPU acceleration)
- [ ] T114 Test performance with 100 tasks using seed data script, verify <1s load time with Lighthouse
- [ ] T115 Measure drag FPS with 100 tasks using Performance Observer, verify 60 FPS maintained

**Checkpoint**: Task limit enforced, performance targets validated. Should maintain smooth 60 FPS drag with 100 tasks.

---

## Phase 8: Accessibility & Polish

**Purpose**: Ensure WCAG 2.1 Level AA compliance and final UX improvements

### Tests for Accessibility (Write FIRST)

- [ ] T116 [P] Accessibility audit for Board component in frontend/tests/unit/Board.axe.test.jsx (axe-core scan)
- [ ] T117 [P] Accessibility audit for TaskCard component in frontend/tests/unit/TaskCard.axe.test.jsx (axe-core scan)
- [ ] T118 [P] Accessibility audit for TaskForm component in frontend/tests/unit/TaskForm.axe.test.jsx (axe-core scan)
- [ ] T119 E2E test for keyboard navigation in frontend/tests/e2e/accessibility.spec.js (tab through all elements, activate drag with spacebar)
- [ ] T120 E2E test for color contrast in frontend/tests/e2e/accessibility.spec.js (verify 4.5:1 ratio)

### Implementation for Accessibility & Polish

- [ ] T121 [P] Add focus indicators to all interactive elements in frontend/src/components/ (focus:ring-2 focus:ring-blue-500)
- [ ] T122 [P] Add semantic HTML to Board component in frontend/src/components/Board.jsx (main, section, article tags)
- [ ] T123 [P] Add ARIA live regions for screen reader announcements in Board component in frontend/src/components/Board.jsx
- [ ] T124 [P] Ensure all icons have alt text in frontend/src/components/ components
- [ ] T125 [P] Verify color contrast meets WCAG AA standards in frontend/src/index.css
- [ ] T126 Test keyboard navigation flow (tab order logical, all actions accessible)
- [ ] T127 Test with NVDA screen reader on Windows, verify all announcements clear
- [ ] T128 Test with VoiceOver on macOS, verify drag-and-drop instructions announced
- [ ] T129 Run Lighthouse accessibility audit in CI, verify score ≥95
- [ ] T130 [P] Add error message styling for validation errors in frontend/src/components/TaskForm.jsx
- [ ] T131 [P] Add success feedback for task operations in Board component in frontend/src/components/Board.jsx (toast notifications optional)
- [ ] T132 Polish animations and transitions in frontend/src/components/ (200ms cubic-bezier for smooth motion)
- [ ] T133 Add empty state messaging when no tasks exist in Column component in frontend/src/components/Column.jsx

**Checkpoint**: WCAG 2.1 Level AA compliance verified, UX polished and ready for user testing.

---

## Phase 9: Testing & Documentation

**Purpose**: Validate test coverage, run full test suite, update documentation

- [ ] T134 Run full unit test suite with coverage report, verify ≥90% coverage for unit tests
- [ ] T135 Run full integration test suite with coverage report, verify ≥85% coverage for integration tests
- [ ] T136 Run full E2E test suite, verify ≥70% coverage for E2E workflows
- [ ] T137 Run Lighthouse CI with performance budgets, verify all metrics pass (<1s load, <3s TTI, <300KB bundle)
- [ ] T138 Run axe-core accessibility audit, verify no violations
- [ ] T139 Manual cross-browser testing (Chrome, Firefox, Safari, Edge - last 2 years)
- [ ] T140 Manual cross-device testing (iOS Safari, Android Chrome, desktop browsers)
- [ ] T141 [P] Update README.md in repository root with setup instructions and architecture overview
- [ ] T142 [P] Create deployment guide in docs/deployment.md with Supabase and frontend hosting instructions
- [ ] T143 [P] Verify quickstart.md in specs/001-task-board/ is accurate and up-to-date
- [ ] T144 User acceptance testing with 3-5 users, collect feedback
- [ ] T145 Address critical feedback from user testing (iterate as needed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on User Story 1 (Phase 3) - Builds on task display and management
- **User Story 3 (Phase 5)**: Depends on User Story 2 (Phase 4) - Tests responsive layout with full functionality
- **Real-Time & Offline (Phase 6)**: Can start after Foundational (Phase 2), parallel with user stories if desired
- **Task Limit & Performance (Phase 7)**: Depends on all user stories complete
- **Accessibility & Polish (Phase 8)**: Depends on all user stories complete
- **Testing & Documentation (Phase 9)**: Depends on all implementation phases complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Foundation for all other stories
- **User Story 2 (P2)**: Depends on User Story 1 - Drag-and-drop requires tasks to exist and display
- **User Story 3 (P3)**: Depends on User Story 2 - Responsive testing requires full feature set

### Within Each User Story

- Tests (T025-T036 for US1, T048-T055 for US2, etc.) MUST be written and FAIL before implementation
- Models/components before services
- Services before integration
- Core implementation before edge cases
- Story complete and all tests passing before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T003, T004, T005, T006, T008, T009, T010, T011, T012, T013 can run in parallel
- **Foundational Phase**: T019, T020, T021, T024 can run in parallel
- **User Story 1 Tests**: T025-T033 can run in parallel (all test files)
- **User Story 1 Implementation**: T037, T038, T039 can run in parallel (different components)
- **User Story 2 Tests**: T048, T049, T050, T051, T052 can run in parallel
- **User Story 2 Implementation**: T056, T067 can run in parallel with other drag implementation after T058 completes
- **User Story 3 Tests**: T068, T069, T070, T071 can run in parallel
- **User Story 3 Implementation**: T075, T076, T077, T078 can run in parallel
- **Real-Time Tests**: T084, T085, T086, T087, T088 can run in parallel
- **Real-Time Implementation**: T091, T092 can run in parallel
- **Accessibility Tests**: T116, T117, T118 can run in parallel
- **Accessibility Implementation**: T121, T122, T123, T124, T125 can run in parallel
- **Documentation**: T141, T142, T143 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all unit tests for User Story 1 together:
Task T025: "Unit test for task validation utility in frontend/tests/unit/validation.test.js"
Task T026: "Unit test for text truncation utility in frontend/tests/unit/truncate.test.js"
Task T027: "Unit test for taskService.getTasks() in frontend/tests/unit/taskService.test.js"
Task T028: "Unit test for taskService.createTask() in frontend/tests/unit/taskService.test.js"
Task T029: "Unit test for taskService.updateTask() in frontend/tests/unit/taskService.test.js"
Task T030: "Unit test for taskService.deleteTask() in frontend/tests/unit/taskService.test.js"

# Launch all integration tests for User Story 1 together:
Task T031: "Integration test for TaskCard component in frontend/tests/integration/TaskCard.test.jsx"
Task T032: "Integration test for TaskForm component in frontend/tests/integration/TaskForm.test.jsx"
Task T033: "Integration test for Board component in frontend/tests/integration/Board.test.jsx"

# Launch all component implementations for User Story 1 together:
Task T037: "Create Column component in frontend/src/components/Column.jsx"
Task T038: "Create TaskCard component in frontend/src/components/TaskCard.jsx"
Task T039: "Create TaskForm modal component in frontend/src/components/TaskForm.jsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch all unit tests for User Story 2 together:
Task T048: "Unit test for useDragState hook in frontend/tests/unit/useDragState.test.js"
Task T049: "Unit test for drag queue management in frontend/tests/unit/useDragState.test.js"

# Launch all integration tests for User Story 2 together:
Task T050: "Integration test for drag-and-drop status change in frontend/tests/integration/Board-drag.test.jsx"
Task T051: "Integration test for drag cancellation in frontend/tests/integration/Board-drag.test.jsx"
Task T052: "Integration test for touch drag activation in frontend/tests/integration/Board-drag.test.jsx"

# After T058 completes, these can run in parallel:
Task T056: "Create useDragState hook in frontend/src/hooks/useDragState.js"
Task T067: "Add ARIA labels and semantic HTML in frontend/src/components/Column.jsx and TaskCard.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T013)
2. Complete Phase 2: Foundational (T014-T024) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T025-T047)
4. **STOP and VALIDATE**: Run all User Story 1 tests (T025-T036), verify all pass
5. Test independently: Create, view, edit, delete tasks
6. Deploy/demo if ready - functional task list application

### Incremental Delivery

1. Complete Setup + Foundational (Phases 1-2) → Foundation ready
2. Add User Story 1 (Phase 3) → Test independently (T025-T036) → Deploy/Demo (MVP!)
3. Add User Story 2 (Phase 4) → Test independently (T048-T055) → Deploy/Demo (Kanban upgrade!)
4. Add User Story 3 (Phase 5) → Test independently (T068-T074) → Deploy/Demo (Multi-device!)
5. Add Real-Time & Offline (Phase 6) → Test (T084-T090) → Deploy/Demo (Collaboration!)
6. Add Task Limit & Performance (Phase 7) → Validate targets → Deploy/Demo (Production-ready!)
7. Add Accessibility & Polish (Phase 8) → Audit (T116-T120) → Deploy/Demo (Fully accessible!)
8. Each increment adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2, T001-T024)
2. **Once Foundational is done**:
   - Developer A: Focus on User Story 1 (Phase 3, T025-T047)
   - Developer B: Focus on Real-Time & Offline (Phase 6, T084-T101) in parallel
   - Developer C: Focus on Task Limit validation and test infrastructure (Phase 7 tests)
3. **Sequential for dependent stories**:
   - After US1 complete: Developer completes User Story 2 (Phase 4)
   - After US2 complete: Developer completes User Story 3 (Phase 5)
4. **Final phases together**: Accessibility, Performance optimization, Documentation (Phases 7-9)

---

## Summary

**Total Tasks**: 145 tasks
**Task Breakdown by User Story**:
- Setup (Phase 1): 13 tasks
- Foundational (Phase 2): 11 tasks
- User Story 1 - Basic Task Management (Phase 3): 23 tasks (12 tests + 11 implementation)
- User Story 2 - Drag-and-Drop (Phase 4): 20 tasks (8 tests + 12 implementation)
- User Story 3 - Responsive Multi-Device (Phase 5): 16 tasks (7 tests + 9 implementation)
- Real-Time & Offline (Phase 6): 18 tasks (7 tests + 11 implementation)
- Task Limit & Performance (Phase 7): 14 tasks (4 tests + 10 implementation)
- Accessibility & Polish (Phase 8): 18 tasks (5 tests + 13 implementation)
- Testing & Documentation (Phase 9): 12 tasks

**Parallel Opportunities Identified**: 62 tasks marked with [P] can run in parallel within their phases

**Independent Test Criteria**:
- **User Story 1**: Create, view, edit, delete tasks → Functional task list application
- **User Story 2**: Drag tasks between columns → Kanban workflow management
- **User Story 3**: Use on any device → Multi-device accessibility

**Suggested MVP Scope**: 
- **Minimum**: Phases 1-3 (Setup + Foundational + User Story 1) = 47 tasks → Basic task management
- **Recommended**: Phases 1-4 (+ User Story 2) = 67 tasks → Complete Kanban experience
- **Full MVP**: Phases 1-9 (all features) = 145 tasks → Production-ready with all requirements

**Format Validation**: ✅ All 145 tasks follow the required checklist format:
- Checkbox: `- [ ]`
- Task ID: T001-T145 (sequential)
- [P] marker: Present on 62 parallelizable tasks
- [Story] label: US1, US2, US3 labels on all user story phase tasks (Phases 3-5)
- Description: Includes file paths for all implementation tasks

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [Story] label maps task to specific user story for traceability (US1, US2, US3)
- Each user story should be independently completable and testable
- **TDD CRITICAL**: Verify tests fail before implementing (write tests first!)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Real-time and offline features (Phase 6) can be developed in parallel with user stories if desired
- Performance budgets enforced in CI/CD pipeline
- Accessibility is non-negotiable - must achieve WCAG 2.1 Level AA
