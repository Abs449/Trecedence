import React from 'react';
import type { NodeProps } from 'reactflow';
import { Play, ClipboardList, CheckSquare, Zap, Square } from 'lucide-react';
import { NodeWrapper } from './NodeWrapper';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
} from '../../types/workflow';

// ─── Start Node ───────────────────────────────────────────────
export const StartNode: React.FC<NodeProps<StartNodeData>> = ({ id, data, selected }) => (
  <NodeWrapper
    id={id}
    selected={selected}
    borderColor="#22C55E"
    bgColor="#DCFCE7"
    icon={<Play size={16} className="text-green-600" fill="#22C55E" />}
    label={data.title || 'Start'}
    sublabel="Workflow entry point"
    hasTarget={false}
    badge={
      data.metadata?.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {data.metadata.slice(0, 2).map((m, i) => (
            <span key={i} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md font-mono">
              {m.key}
            </span>
          ))}
          {data.metadata.length > 2 && (
            <span className="text-[10px] text-muted">+{data.metadata.length - 2} more</span>
          )}
        </div>
      ) : null
    }
  />
);

// ─── Task Node ────────────────────────────────────────────────
export const TaskNode: React.FC<NodeProps<TaskNodeData>> = ({ id, data, selected }) => (
  <NodeWrapper
    id={id}
    selected={selected}
    borderColor="#4F6EF7"
    bgColor="#EEF1FE"
    icon={<ClipboardList size={16} className="text-primary" />}
    label={data.title || 'Task'}
    sublabel={data.assignee ? `→ ${data.assignee}` : data.description || 'Human task'}
    badge={
      <div className="flex flex-wrap gap-1">
        {data.assignee && (
          <span className="text-[10px] bg-primary-light text-primary px-1.5 py-0.5 rounded-md font-medium">
            {data.assignee}
          </span>
        )}
        {data.dueDate && (
          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
            {data.dueDate}
          </span>
        )}
      </div>
    }
  />
);

// ─── Approval Node ────────────────────────────────────────────
export const ApprovalNode: React.FC<NodeProps<ApprovalNodeData>> = ({ id, data, selected }) => (
  <NodeWrapper
    id={id}
    selected={selected}
    borderColor="#F59E0B"
    bgColor="#FEF3C7"
    icon={<CheckSquare size={16} className="text-amber-500" />}
    label={data.title || 'Approval'}
    sublabel={data.approverRole || 'Pending approver'}
    badge={
      data.autoApproveThreshold > 0 ? (
        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md">
          Auto-approve ≤ {data.autoApproveThreshold}%
        </span>
      ) : null
    }
  />
);

// ─── Automated Node ───────────────────────────────────────────
export const AutomatedNode: React.FC<NodeProps<AutomatedNodeData>> = ({ id, data, selected }) => (
  <NodeWrapper
    id={id}
    selected={selected}
    borderColor="#8B5CF6"
    bgColor="#EDE9FE"
    icon={<Zap size={16} className="text-purple-600" />}
    label={data.title || 'Automated Step'}
    sublabel={data.actionId ? data.actionId.replace(/_/g, ' ') : 'No action selected'}
    badge={
      data.actionId ? (
        <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-md font-mono">
          {data.actionId}
        </span>
      ) : null
    }
  />
);

// ─── End Node ─────────────────────────────────────────────────
export const EndNode: React.FC<NodeProps<EndNodeData>> = ({ id, data, selected }) => (
  <NodeWrapper
    id={id}
    selected={selected}
    borderColor="#EF4444"
    bgColor="#FEE2E2"
    icon={<Square size={16} className="text-red-500" fill="#EF4444" />}
    label="End"
    sublabel={data.endMessage || 'Workflow complete'}
    hasSource={false}
    badge={
      data.summaryFlag ? (
        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md">
          Summary enabled
        </span>
      ) : null
    }
  />
);
