import React from 'react';
import { X, Play, ClipboardList, CheckSquare, Zap, Square, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import {
  StartNodeForm,
  TaskNodeForm,
  ApprovalNodeForm,
  AutomatedNodeForm,
  EndNodeForm,
} from './forms/NodeForms';
import type { NodeType, WorkflowNodeData } from '../types/workflow';

const NODE_META: Record<NodeType, { label: string; icon: React.ReactNode; color: string }> = {
  start: { label: 'Start Node', icon: <Play size={14} fill="#22C55E" className="text-green-600" />, color: '#22C55E' },
  task: { label: 'Task Node', icon: <ClipboardList size={14} className="text-blue-500" />, color: '#4F6EF7' },
  approval: { label: 'Approval Node', icon: <CheckSquare size={14} className="text-amber-500" />, color: '#F59E0B' },
  automated: { label: 'Automated Step', icon: <Zap size={14} className="text-purple-500" />, color: '#8B5CF6' },
  end: { label: 'End Node', icon: <Square size={14} fill="#EF4444" className="text-red-500" />, color: '#EF4444' },
};

export const NodeConfigPanel: React.FC = () => {
  const { nodes, selectedNodeId, setSelectedNodeId, deleteNode } = useWorkflowStore();

  if (!selectedNodeId) return null;

  const node = nodes.find(n => n.id === selectedNodeId);
  if (!node) return null;

  const data = node.data as WorkflowNodeData;
  const nodeType = data.nodeType as NodeType;
  const meta = NODE_META[nodeType];

  return (
    <aside
      className="w-72 bg-white border-l border-border flex flex-col h-full panel-enter overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: meta.color + '20',
          }}
        >
          {meta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-800">{meta.label}</div>
          <div className="text-[10px] text-muted font-mono truncate">id: {node.id}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => deleteNode(selectedNodeId)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-canvas text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Accent line */}
      <div className="h-0.5 w-full" style={{ background: meta.color }} />

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {nodeType === 'start' && <StartNodeForm id={node.id} data={data as any} />}
        {nodeType === 'task' && <TaskNodeForm id={node.id} data={data as any} />}
        {nodeType === 'approval' && <ApprovalNodeForm id={node.id} data={data as any} />}
        {nodeType === 'automated' && <AutomatedNodeForm id={node.id} data={data as any} />}
        {nodeType === 'end' && <EndNodeForm id={node.id} data={data as any} />}
      </div>
    </aside>
  );
};
