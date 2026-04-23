import React from 'react';
import { Handle, Position } from 'reactflow';
import { Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore';

interface NodeWrapperProps {
  id: string;
  selected: boolean;
  borderColor: string;
  bgColor: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  hasSource?: boolean;
  hasTarget?: boolean;
  badge?: React.ReactNode;
}

export const NodeWrapper: React.FC<NodeWrapperProps> = ({
  id,
  selected,
  borderColor,
  bgColor,
  icon,
  label,
  sublabel,
  hasSource = true,
  hasTarget = true,
  badge,
}) => {
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  return (
    <div
      className={`
        relative group min-w-[200px] max-w-[240px] rounded-xl bg-white
        border-2 transition-all duration-150 select-none
        ${selected ? 'shadow-node-selected' : 'shadow-node hover:shadow-md'}
      `}
      style={{
        borderColor: selected ? borderColor : '#E2E4E9',
        borderWidth: selected ? 2 : 1.5,
      }}
    >
      {/* Color strip */}
      <div
        className="h-1 rounded-t-xl"
        style={{ background: borderColor }}
      />

      {/* Delete button */}
      <button
        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-white border border-red-200 rounded-full
                   flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
                   hover:bg-red-50 shadow-sm"
        onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
      >
        <Trash2 size={11} className="text-red-400" />
      </button>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start gap-2.5">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: bgColor }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-800 truncate leading-tight">
              {label}
            </div>
            {sublabel && (
              <div className="text-xs text-muted mt-0.5 truncate">{sublabel}</div>
            )}
          </div>
        </div>
        {badge && <div className="mt-2">{badge}</div>}
      </div>

      {/* Handles */}
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: borderColor, top: -5 }}
        />
      )}
      {hasSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: borderColor, bottom: -5 }}
        />
      )}
    </div>
  );
};
