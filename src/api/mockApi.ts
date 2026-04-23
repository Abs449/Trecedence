import type { AutomationAction, SimulationResult, SimulationStep, WorkflowNodeData } from '../types/workflow';
import type { Node, Edge } from 'reactflow';

// --- Mock data ---
const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'notify_slack', label: 'Notify Slack Channel', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create HR Ticket', params: ['category', 'priority'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employeeId', 'field', 'value'] },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['attendees', 'title', 'duration'] },
];

// --- GET /automations ---
export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return MOCK_AUTOMATIONS;
}

// --- POST /simulate ---
export async function simulateWorkflow(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): Promise<SimulationResult> {
  await delay(800);

  const errors: string[] = [];
  const steps: SimulationStep[] = [];

  // Validate structure
  const startNodes = nodes.filter(n => n.data.nodeType === 'start');
  const endNodes = nodes.filter(n => n.data.nodeType === 'end');

  if (startNodes.length === 0) errors.push('Workflow must have a Start node.');
  if (startNodes.length > 1) errors.push('Workflow can only have one Start node.');
  if (endNodes.length === 0) errors.push('Workflow must have an End node.');

  // Build adjacency for traversal
  const adjacency = new Map<string, string[]>();
  nodes.forEach(n => adjacency.set(n.id, []));
  edges.forEach(e => {
    const list = adjacency.get(e.source) || [];
    list.push(e.target);
    adjacency.set(e.source, list);
  });

  // Check disconnected nodes (excluding start)
  const visited = new Set<string>();
  if (startNodes.length > 0) {
    bfs(startNodes[0].id, adjacency, visited);
    nodes.forEach(n => {
      if (!visited.has(n.id) && n.data.nodeType !== 'start') {
        errors.push(`Node "${(n.data as any).title || n.data.label}" is not connected.`);
      }
    });
  }

  // Check for cycles (simple DFS)
  if (hasCycle(nodes, edges)) {
    errors.push('Workflow contains a cycle. Workflows must be acyclic.');
  }

  if (errors.length > 0) {
    return { success: false, steps: [], summary: 'Validation failed.', errors };
  }

  // Simulate traversal in topological order
  const order = topologicalSort(nodes, edges);
  const now = new Date();

  for (let i = 0; i < order.length; i++) {
    const node = order[i];
    const data = node.data;
    await delay(120);

    const ts = new Date(now.getTime() + i * 2000).toLocaleTimeString();

    let step: SimulationStep;

    switch (data.nodeType) {
      case 'start':
        step = {
          nodeId: node.id,
          nodeType: 'start',
          label: (data as any).title || 'Start',
          status: 'success',
          message: `Workflow initiated: "${(data as any).title}"`,
          timestamp: ts,
        };
        break;

      case 'task': {
        const d = data as any;
        const hasAssignee = !!d.assignee?.trim();
        step = {
          nodeId: node.id,
          nodeType: 'task',
          label: d.title || 'Task',
          status: hasAssignee ? 'success' : 'warning',
          message: hasAssignee
            ? `Task "${d.title}" assigned to ${d.assignee}${d.dueDate ? ` (due ${d.dueDate})` : ''}`
            : `Task "${d.title}" has no assignee — will require manual assignment.`,
          timestamp: ts,
        };
        break;
      }

      case 'approval': {
        const d = data as any;
        const threshold = d.autoApproveThreshold;
        const autoApproved = threshold > 0 && threshold <= 50;
        step = {
          nodeId: node.id,
          nodeType: 'approval',
          label: d.title || 'Approval',
          status: 'success',
          message: autoApproved
            ? `Auto-approved by ${d.approverRole} (threshold ≤ ${threshold}%)`
            : `Awaiting approval from ${d.approverRole || 'designated approver'}`,
          timestamp: ts,
        };
        break;
      }

      case 'automated': {
        const d = data as any;
        const action = MOCK_AUTOMATIONS.find(a => a.id === d.actionId);
        const filledParams = action ? action.params.filter(p => !!d.actionParams?.[p]?.trim()) : [];
        const allFilled = action ? filledParams.length === action.params.length : false;
        step = {
          nodeId: node.id,
          nodeType: 'automated',
          label: d.title || 'Automated Step',
          status: !action ? 'error' : allFilled ? 'success' : 'warning',
          message: !action
            ? `No action configured for automated step "${d.title}"`
            : allFilled
            ? `Executing: ${action.label} with all parameters set`
            : `Executing: ${action.label} — ${action.params.length - filledParams.length} param(s) missing`,
          timestamp: ts,
        };
        break;
      }

      case 'end': {
        const d = data as any;
        step = {
          nodeId: node.id,
          nodeType: 'end',
          label: 'End',
          status: 'success',
          message: d.endMessage || 'Workflow completed successfully.',
          timestamp: ts,
        };
        break;
      }

      default:
        step = { nodeId: node.id, nodeType: 'start', label: 'Unknown', status: 'skipped', message: 'Skipped unknown node.', timestamp: ts };
    }

    steps.push(step);
  }

  const hasErrors = steps.some(s => s.status === 'error');
  const hasWarnings = steps.some(s => s.status === 'warning');

  return {
    success: !hasErrors,
    steps,
    summary: hasErrors
      ? 'Simulation completed with errors.'
      : hasWarnings
      ? `Simulation completed with ${steps.filter(s => s.status === 'warning').length} warning(s).`
      : `Simulation completed successfully across ${steps.length} steps.`,
    errors: [],
  };
}

// --- Helpers ---
function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function bfs(start: string, adjacency: Map<string, string[]>, visited: Set<string>) {
  const queue = [start];
  while (queue.length) {
    const curr = queue.shift()!;
    if (visited.has(curr)) continue;
    visited.add(curr);
    (adjacency.get(curr) || []).forEach(n => queue.push(n));
  }
}

function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => adj.get(e.source)?.push(e.target));

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();
  nodes.forEach(n => color.set(n.id, WHITE));

  function dfs(u: string): boolean {
    color.set(u, GRAY);
    for (const v of adj.get(u) || []) {
      if (color.get(v) === GRAY) return true;
      if (color.get(v) === WHITE && dfs(v)) return true;
    }
    color.set(u, BLACK);
    return false;
  }

  for (const n of nodes) {
    if (color.get(n.id) === WHITE && dfs(n.id)) return true;
  }
  return false;
}

function topologicalSort(nodes: Node<WorkflowNodeData>[], edges: Edge[]): Node<WorkflowNodeData>[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  const nodeMap = new Map<string, Node<WorkflowNodeData>>();

  nodes.forEach(n => { inDegree.set(n.id, 0); adj.set(n.id, []); nodeMap.set(n.id, n); });
  edges.forEach(e => {
    adj.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const queue = nodes.filter(n => inDegree.get(n.id) === 0);
  const result: Node<WorkflowNodeData>[] = [];

  while (queue.length) {
    const curr = queue.shift()!;
    result.push(curr);
    for (const next of adj.get(curr.id) || []) {
      const deg = (inDegree.get(next) || 1) - 1;
      inDegree.set(next, deg);
      if (deg === 0) queue.push(nodeMap.get(next)!);
    }
  }

  return result;
}
