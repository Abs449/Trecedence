# HR Workflow Designer — Case Study Solution

## Project Overview

**Project Name:** HR Workflow Designer
**Project Type:** Full-Stack Engineering Intern Case Study Submission
**Core Functionality:** A visual, drag-and-drop HR workflow builder that enables users to design, configure, and simulate HR processes such as employee onboarding, leave approval, and document verification entirely in the browser without requiring a backend.

---

## Problem Statement

Organizations need a way to visually design, configure, and test HR workflows without writing code or requiring technical expertise. Traditional workflow tools are either too complex, require expensive licenses, or lack the ability to simulate and validate processes before deployment.

This project delivers a fully functional, browser-based workflow designer that allows HR teams to:
- Drag-and-drop workflow nodes onto a canvas
- Configure each node type with relevant parameters
- Connect nodes to define process flow
- Simulate workflow execution with real-time validation
- Export and import workflows as portable JSON files

---

## Technical Architecture

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | React 18 + TypeScript | Type safety across node data structures, forms, and simulation logic |
| Build Tool | Vite | Fast hot module replacement, zero-config TypeScript support |
| Canvas Library | React Flow | Handles node rendering, edge routing, pan/zoom functionality, and drag handles |
| State Management | Zustand | Minimal boilerplate; avoids Context prop-drilling across three independent panels |
| Styling | Tailwind CSS v3 | Utility-first approach with consistent spacing/color tokens, no runtime overhead |
| Icons | Lucide React | Tree-shakeable icons with consistent stroke style |
| Mock API | Local Module (`api/mockApi.ts`) | No server required; isolated behind an async interface for easy replacement |

### Folder Structure

```
hr-workflow-designer/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                         # React root mount
    ├── App.tsx                          # Root layout (Sidebar | Canvas | ConfigPanel | Modal)
    ├── index.css                        # Tailwind directives + global styles + animations
    │
    ├── types/
    │   └── workflow.ts                  # All TypeScript types and discriminated unions
    │
    ├── api/
    │   └── mockApi.ts                   # GET /automations + POST /simulate (local mock)
    │
    ├── store/
    │   └── workflowStore.ts             # Zustand store: nodes, edges, selection, sandbox state
    │
    └── components/
        ├── nodes/
        │   ├── NodeWrapper.tsx          # Shared visual shell for all node types
        │   └── CustomNodes.tsx          # StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode
        │
        ├── forms/
        │   ├── FormPrimitives.tsx       # TextInput, Select, Toggle, Textarea, KVEditor, Section
        │   └── NodeForms.tsx            # Per-node configuration forms
        │
        ├── Sidebar.tsx                  # Draggable node palette, stats, import/export
        ├── WorkflowCanvas.tsx           # React Flow canvas, drop handler, top toolbar
        ├── NodeConfigPanel.tsx          # Right-side sliding panel for selected node
        └── SandboxPanel.tsx             # Simulation modal: JSON preview, execution log, summary
```

### Data Flow Architecture

```
User drags node          User edits form field       User clicks "Run"
       │                        │                          │
       ▼                        ▼                          ▼
workflowStore               workflowStore             mockApi.ts
  addNode()               updateNodeData()           simulateWorkflow()
       │                        │                          │
       └──────────────┬─────────┘                   Topological sort
                      ▼                             + validation pass
               React Flow re-renders                      │
               (nodes/edges reactively                     ▼
                bound to store)                  SimulationResult returned
                                                 → SandboxPanel renders steps
```

All state resides in a single Zustand store. React Flow reads `nodes` and `edges` directly, eliminating the need for an intermediate synchronization layer. Any component can subscribe to any state slice without prop chains.

---

## Core Features Implemented

### 1. Drag-and-Drop Canvas

- **Technology:** React Flow
- **Functionality:** Users can drag workflow nodes from the sidebar palette onto the canvas
- **Interactions:** Pan, zoom, node selection, edge creation by dragging between handles
- **Edge Style:** Smooth-step edges with arrow markers for clear directional flow

### 2. Five Node Types

| Node Type | Purpose | Configuration Fields |
|-----------|---------|---------------------|
| **Start** | Marks workflow entry point | Title, metadata (key-value pairs) |
| **Task** | Manual HR task | Title, description, assignee, due date, custom fields |
| **Approval** | Multi-level approval flow | Title, approver role, auto-approve threshold |
| **Automated** | System action | Action selection (from API), dynamic parameters |
| **End** | Workflow termination | End message, summary flag |

### 3. Node Configuration Panel

- Animated slide-in panel on node selection
- Different form for each node type
- Real-time updates to node data
- Form validation and field completeness indicators

### 4. Simulation Engine

The simulation in `mockApi.ts` implements a real graph algorithm:

1. **Structural Validation** — Checks for missing Start node, multiple Start nodes, missing End node
2. **Reachability Analysis (BFS)** — Walks from Start via edge connections; flags any disconnected nodes
3. **Cycle Detection (DFS Coloring)** — WHITE/GRAY/BLACK three-color algorithm; detects back-edges indicating cycles
4. **Topological Sort (Kahn's Algorithm)** — Produces execution order by dequeuing zero-in-degree nodes
5. **Per-Node Evaluation** — Each node is inspected for configuration completeness; emits `success | warning | error` status with human-readable messages

### 5. Mock API Endpoints

- **GET /automations** — Returns 6 predefined actions with typed parameters
- **POST /simulate** — Accepts workflow graph, returns step-by-step execution results

### 6. Import/Export

- **Export:** Downloads current workflow as `workflow.json`
- **Import:** File picker to load workflow JSON with validation

### 7. Additional Features

- Mini-map with color-coded node types
- Zoom controls
- Delete key and trash icon for node/edge removal
- Key-value editor for metadata fields

---

## Design Decisions & Trade-offs

### 1. Zustand vs. Context + useReducer

**Decision:** Used Zustand over Context + useReducer

**Rationale:** Three separate UI panels (Sidebar, Canvas, NodeConfigPanel) all need access to the same `nodes` array. With Context, this requires either:
- One monolithic provider causing global re-renders on every node move
- Multiple fine-grained contexts with complex synchronization

Zustand provides direct selector subscriptions. A node position drag only re-renders the canvas; the config panel doesn't re-render unless the selected node's data changes.

### 2. NodeWrapper as Unified Shell

**Decision:** Single `NodeWrapper` component handles all shared node UI

**Rationale:** Every node needs a color-coded top strip, icon area, label, delete button on hover, and React Flow handles. Instead of repeating this structure five times, `NodeWrapper` encapsulates all common UI. Each node type only provides:
- Icon
- Colors
- Label text
- Optional badge

**Future Extensibility:** Adding a new node type requires only:
1. Define data interface in `types/workflow.ts`
2. Create component using `<NodeWrapper />`
3. Add form in `NodeForms.tsx`

Zero changes needed to handles, delete logic, selection styling, or canvas registration.

### 3. FormPrimitives as Atomic Library

**Decision:** All form fields defined as reusable atoms in `FormPrimitives.tsx`

**Rationale:** Ensures visual consistency across all five node forms. Benefits:
- Consistency is guaranteed, not coordinated
- New node forms require no CSS
- Base style changes propagate everywhere automatically

### 4. Isolated API Layer

**Decision:** `src/api/mockApi.ts` exports async functions as black boxes

**Rationale:** Replacing mocks with real `fetch()` calls, MSW handlers, or an RTK Query endpoint requires changes in exactly one file. All other modules (components, store, simulation panel) remain unaware of the data source.

### 5. Discriminated Unions for Node Types

**Decision:** TypeScript discriminated unions with `nodeType` as discriminant

**Rationale:** Every `switch (data.nodeType)` is exhaustively type-checked by the compiler. No runtime `instanceof` or string guards needed. Adding a new node type triggers TypeScript errors in all unupdated switch statements.

---

## Validation & Error Handling

### Structural Validation
- Missing Start node → Error
- Multiple Start nodes → Error
- Missing End node → Error

### Graph Analysis
- **Disconnected nodes** — Detected via BFS from Start node
- **Cycles** — Detected via DFS three-color algorithm
- **Incomplete configurations** — Each node type validates required fields

### Simulation Results
- **Success** — Node configured correctly, ready for execution
- **Warning** — Node has optional fields missing or unusual configuration
- **Error** — Node missing required configuration or prevents simulation

---

## Limitations & Future Enhancements

### High Priority (Next Steps)

1. **Undo/Redo System** — Implement command-pattern middleware on Zustand store or use React Flow's `useUndoRedo` hook
2. **Visual Validation Badges** — Display red dot badge on nodes with unmet required fields
3. **Conditional Edges** — Support "Approved"/"Rejected" labeled edges from Approval nodes

### Medium Priority

4. **Auto-Layout** — Integrate Dagre or ELK.js for automatic node positioning
5. **Workflow Templates** — Pre-built templates for common HR processes
6. **Node Version History** — Per-node edit history with rollback capability

### Lower Priority

7. **Real Backend Integration** — Replace mock API with actual REST endpoints
8. **Keyboard Shortcuts** — Ctrl+Z/Y (undo/redo), Ctrl+D (duplicate), Escape (deselect)
9. **Accessibility** — Focus management, keyboard navigation, ARIA roles, contrast audit

---

## Assumptions

1. **No authentication or persistence required** — All state is in-memory; resets on page refresh
2. **Delete key removes selected elements** — Avoids accidental deletion while typing
3. **autoApproveThreshold is percentage (0-100)** — 0 = disabled, 1-50 = low-value auto-approval
4. **Single Start node per workflow** — Multiple Start nodes flagged as error
5. **Directional edges only** — Bidirectional connections not supported
6. **Automated Step params are free-text** — Production would use typed parameters from API

---

## Conclusion

This HR Workflow Designer demonstrates a complete, production-quality single-page application with:
- Intuitive drag-and-drop interface
- Five distinct node types with full configuration
- Real graph algorithm simulation engine
- Type-safe architecture with discriminated unions
- Clean separation of concerns
- Extensible component design

The solution prioritizes maintainability, type safety, and user experience while remaining fully functional without external services.
