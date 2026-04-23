# HR Workflow Designer
### Full-Stack Engineering Intern — Case Study Submission

> A visual, drag-and-drop HR workflow builder. Design, configure, and simulate processes like onboarding, leave approval, and document verification — all in the browser, no backend required.

---

## Table of Contents

1. [How to Run](#how-to-run)
2. [Architecture](#architecture)
3. [Design Decisions](#design-decisions)
4. [What Was Completed](#what-was-completed)
5. [What I Would Add With More Time](#what-i-would-add-with-more-time)
6. [Assumptions](#assumptions)

---

## How to Run

**Prerequisites:** Node.js 18+ and npm.

```bash
# 1. Unzip the project
unzip hr-workflow-designer.zip
cd hr-workflow-designer

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
# → http://localhost:5173
```

**Other commands:**
```bash
npm run build     # Type-check + production bundle (outputs to /dist)
npm run preview   # Serve the production build locally
npm run lint      # ESLint check
```

No environment variables, `.env` files, or external services are needed. Everything runs fully offline after `npm install`.

---

## Architecture

### Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React 18 + TypeScript** | Type safety across node data, forms, and simulation |
| Build tool | **Vite** | Fast HMR, zero-config TS, recommended by spec |
| Canvas | **React Flow** | Handles node rendering, edge routing, pan/zoom, drag handles |
| State | **Zustand** | Minimal boilerplate; avoids Context prop-drilling across three independent panels |
| Styling | **Tailwind CSS v3** | Utility-first, consistent spacing/color tokens, no runtime overhead |
| Icons | **Lucide React** | Tree-shakeable, consistent stroke style |
| Mock API | **Local module (`api/mockApi.ts`)** | No server needed; isolated behind an async interface |

---

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
        │   └── NodeForms.tsx            # Per-node config forms (StartNodeForm … EndNodeForm)
        │
        ├── Sidebar.tsx                  # Draggable node palette, stats, import/export
        ├── WorkflowCanvas.tsx           # React Flow canvas, drop handler, top toolbar
        ├── NodeConfigPanel.tsx          # Right-side sliding panel for selected node
        └── SandboxPanel.tsx             # Simulation modal: JSON preview, execution log, summary
```

---

### Data Flow

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

All state lives in a single Zustand store. React Flow reads `nodes` and `edges` directly from it, so there is no intermediate synchronization layer. Any component can subscribe to any slice without prop chains.

---

### Type System

Every node's `data` object carries a `nodeType` discriminant field:

```typescript
// types/workflow.ts
type WorkflowNodeData =
  | StartNodeData      // { nodeType: 'start', title, metadata }
  | TaskNodeData       // { nodeType: 'task',  title, assignee, dueDate, ... }
  | ApprovalNodeData   // { nodeType: 'approval', approverRole, autoApproveThreshold }
  | AutomatedNodeData  // { nodeType: 'automated', actionId, actionParams }
  | EndNodeData;       // { nodeType: 'end', endMessage, summaryFlag }
```

This discriminated union means every `switch (data.nodeType)` statement in forms, the simulation engine, and the config panel is **exhaustively type-checked by the compiler** — no runtime `instanceof` or string guards needed.

---

### Simulation Engine (mock `POST /simulate`)

The simulation in `mockApi.ts` is a real graph algorithm, not a stub:

1. **Structural validation** — checks for missing Start node, multiple Start nodes, missing End node.
2. **Reachability (BFS)** — walks from Start via edge connections; any node not visited is flagged as disconnected.
3. **Cycle detection (DFS coloring)** — WHITE / GRAY / BLACK three-color algorithm; any back-edge (GRAY → GRAY) means a cycle.
4. **Topological sort (Kahn's algorithm)** — produces execution order by repeatedly dequeuing zero-in-degree nodes.
5. **Per-node evaluation** — each node in topological order is inspected for config completeness (missing assignee, no action selected, etc.) and emits a `success | warning | error` step with a human-readable message.

---

## Design Decisions

### 1. Zustand over Context + useReducer

Three separate UI panels — Sidebar, Canvas, and NodeConfigPanel — all need to read and write the same `nodes` array. With Context, that means either one monolithic provider wrapping everything (re-renders the whole tree on every node move) or multiple fine-grained contexts with messy synchronization.

Zustand gives each component a direct selector subscription. A node position drag only re-renders the canvas; the config panel doesn't re-render unless the selected node's data actually changes.

### 2. `NodeWrapper` as a single shell for all node types

Every node — regardless of type — needs: a color-coded top strip, an icon area, a label, a delete button on hover, and React Flow source/target handles. Rather than repeating that structure five times, `NodeWrapper` owns all of it. Each node type (e.g., `TaskNode`) only provides the icon, colors, label text, and an optional badge.

**Adding a new node type in the future is three steps:**
1. Define its data interface in `types/workflow.ts`.
2. Create a component that renders `<NodeWrapper ... />`.
3. Add a form in `NodeForms.tsx` that calls `updateNodeData`.

Zero changes to handles, delete logic, selection styling, or canvas registration.

### 3. `FormPrimitives.tsx` as a form atom library

All form fields (TextInput, Select, Textarea, Toggle, KVEditor) are defined once with consistent focus rings, border colors, placeholder styles, and spacing. Every node form is built by composing these atoms. This means:

- Visual consistency across all five forms is guaranteed, not coordinated.
- A new node form needs no CSS — just import atoms and compose.
- Changing the base input style (e.g., adding an error state) applies everywhere automatically.

### 4. Isolated API layer

`src/api/mockApi.ts` exports two async functions: `getAutomations()` and `simulateWorkflow()`. Every other module treats these as black boxes — they're async, they can fail, and they return typed data.

**Consequence:** replacing the mocks with real `fetch()` calls, MSW handlers, or an RTK Query endpoint requires changes in exactly one file. The components, store, and simulation panel are completely unaware of where data comes from.

### 5. Dynamic Automated Step form

When a user selects an action (e.g., "Send Email"), the form fetches the action's `params` array from the mock API and renders one `TextInput` per parameter. This is driven purely by the API response — no hardcoded parameter lists in the UI. Add a new action with five params to the mock, and the form renders five fields automatically.

### 6. Smooth-step edges with arrow markers

React Flow supports several edge types. `smoothstep` was chosen because it routes around nodes cleanly and produces the orthogonal "connector" look common in workflow tools (vs. `bezier`, which curves freely and can overlap nodes). Arrow markers are added via `defaultEdgeOptions` so every new connection gets them without per-edge configuration.

---

## What Was Completed

### Core Requirements — All Implemented ✅

| Requirement | Status |
|---|---|
| Drag-and-drop canvas (React Flow) | ✅ Complete |
| Start / Task / Approval / Automated / End node types | ✅ All five |
| Drag from sidebar onto canvas | ✅ Complete |
| Connect nodes with edges | ✅ Smooth-step + arrows |
| Select node → config panel appears | ✅ Animated slide-in |
| Delete nodes/edges (Delete key + trash icon) | ✅ Both methods |
| Start Node form (title + metadata KV) | ✅ Complete |
| Task Node form (title, description, assignee, due date, custom KV) | ✅ Complete |
| Approval Node form (title, role dropdown, threshold) | ✅ Complete |
| Automated Step form (action picker + dynamic params) | ✅ Dynamic, API-driven |
| End Node form (message + summary toggle) | ✅ Complete |
| `GET /automations` mock endpoint | ✅ 6 actions with typed params |
| `POST /simulate` mock endpoint | ✅ Full graph traversal |
| Workflow validation (missing nodes, disconnected, cycles) | ✅ All three checks |
| Sandbox panel with step-by-step execution log | ✅ Animated, color-coded |
| Clean folder structure | ✅ |
| Separation of canvas / node / API logic | ✅ Strict |
| Type-safe interfaces for all node data | ✅ Discriminated unions |

### Bonus Features — Implemented ✅

| Bonus | Status |
|---|---|
| Export workflow as JSON | ✅ Downloads `workflow.json` |
| Import workflow from JSON | ✅ File picker, validates on load |
| Mini-map | ✅ Color-coded by node type |
| Zoom controls | ✅ Via React Flow Controls |

---

## What I Would Add With More Time

### High Priority (would add next)

**1. Undo / Redo**
React Flow exposes a `useUndoRedo` hook. Alternatively, a command-pattern middleware on the Zustand store (wrapping `addNode`, `deleteNode`, `updateNodeData`, etc. in reversible command objects with a history stack) would work and is framework-agnostic.

**2. Visual Validation on Nodes**
Currently, validation only runs when the sandbox is opened. With more time, each node would display a small red dot badge if it has unmet required fields (e.g., Automated Step with no action selected, Task with no title). This would be driven by a `validateNodeData(data: WorkflowNodeData): string[]` function per node type, called on every store update.

**3. Conditional / Labeled Edges**
Approval nodes need "Approved" and "Rejected" outgoing paths. This requires a custom edge component with an inline label and the ability to assign a condition string to each edge. The store would need an `edgeCondition` field, and the simulation engine would need to follow only the matching branch.

### Medium Priority

**4. Auto-Layout (Dagre or ELK.js)**
A "Auto-arrange" button would run the node positions through Dagre's layered graph layout algorithm and update all node positions in the store in one call. React Flow has an official example of this pattern.

**5. Workflow Templates**
A template picker at startup (or a button in the sidebar) would load pre-built JSON workflows — "Employee Onboarding", "Leave Approval", "Document Verification" — directly into the store. Since import already works, templates are just bundled JSON files.

**6. Node Version History**
Each `updateNodeData` call would push a snapshot of the previous data to a per-node history array. A "revert" dropdown on the config panel would let users roll back individual node configs without undoing canvas layout changes.

### Lower Priority

**7. Real Backend Integration**
The `api/mockApi.ts` module is the only file that would change. `getAutomations()` becomes `fetch('/api/automations')` and `simulateWorkflow()` becomes a `POST /api/simulate`. Nothing else in the codebase knows the difference.

**8. Keyboard Shortcuts**
`Ctrl+Z` / `Ctrl+Y` for undo/redo, `Ctrl+D` to duplicate a node, `Escape` to deselect — standard workflow tool ergonomics.

**9. Accessibility (a11y)**
Focus management when the config panel opens, keyboard-navigable node selection, ARIA roles on the canvas region, and proper contrast ratio audit on the node color palette.

---

## Assumptions

- **No authentication or persistence** is required per the spec. All state is in-memory and resets on page refresh (except for JSON export/import).
- The **Delete key** (not Backspace) removes selected nodes/edges. This is the React Flow default and avoids accidental deletion while typing in input fields.
- **`autoApproveThreshold`** is treated as a percentage (0–100). A value of 0 means auto-approval is disabled. The simulation auto-approves when the threshold is between 1 and 50 (representing low-value requests).
- **Only one Start node** is valid per workflow. The simulation flags multiple Start nodes as an error.
- **Edges are directional** (source → target). Bidirectional connections are not supported and would create cycles, which the simulation detects.
- The **Automated Step params** are free-text fields. In production, param types (email address, template ID, enum, etc.) would be specified in the API response and the form would render appropriate input types accordingly.