export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValue {
  key: string;
  value: string;
}

export interface StartNodeData {
  nodeType: 'start';
  label: string;
  title: string;
  metadata: KeyValue[];
}

export interface TaskNodeData {
  nodeType: 'task';
  label: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValue[];
}

export interface ApprovalNodeData {
  nodeType: 'approval';
  label: string;
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeData {
  nodeType: 'automated';
  label: string;
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  nodeType: 'end';
  label: string;
  endMessage: string;
  summaryFlag: boolean;
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedNodeData
  | EndNodeData;

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationStep {
  nodeId: string;
  nodeType: NodeType;
  label: string;
  status: 'success' | 'warning' | 'error' | 'skipped';
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  summary: string;
  errors: string[];
}
