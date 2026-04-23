import React from 'react';
import { Play, ClipboardList, CheckSquare, Zap, Square, Workflow, Download, Upload } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';

const NODE_PALETTE = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: <Play size={15} fill="#22C55E" className="text-green-600" />,
    color: '#22C55E',
    bg: '#DCFCE7',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Human task or action',
    icon: <ClipboardList size={15} className="text-blue-500" />,
    color: '#4F6EF7',
    bg: '#EEF1FE',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Manager or HR sign-off',
    icon: <CheckSquare size={15} className="text-amber-500" />,
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  {
    type: 'automated',
    label: 'Automated Step',
    description: 'System-triggered action',
    icon: <Zap size={15} className="text-purple-500" />,
    color: '#8B5CF6',
    bg: '#EDE9FE',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion',
    icon: <Square size={15} fill="#EF4444" className="text-red-500" />,
    color: '#EF4444',
    bg: '#FEE2E2',
  },
];


export const Sidebar: React.FC = () => {
  const { nodes, edges, importWorkflow, exportWorkflow } = useWorkflowStore();

  const handleDragStart = (e: React.DragEvent, nodeType: string) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => importWorkflow(ev.target?.result as string);
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-56 bg-white border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Workflow size={15} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800">HR Flow</div>
            <div className="text-[10px] text-muted">Workflow Designer</div>
          </div>
        </div>
      </div>

      {/* Nodes palette */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1 pb-2">
          Node Types
        </div>

        {NODE_PALETTE.map(node => (
          <div
            key={node.type}
            draggable
            onDragStart={e => handleDragStart(e, node.type)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-white
                       cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm
                       transition-all select-none group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-active:scale-95"
              style={{ background: node.bg }}
            >
              {node.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-700">{node.label}</div>
              <div className="text-[10px] text-muted">{node.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="px-4 py-3 border-t border-border">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-canvas rounded-lg p-2 text-center">
            <div className="text-base font-bold text-gray-800">{nodes.length}</div>
            <div className="text-[10px] text-muted">Nodes</div>
          </div>
          <div className="bg-canvas rounded-lg p-2 text-center">
            <div className="text-base font-bold text-gray-800">{edges.length}</div>
            <div className="text-[10px] text-muted">Edges</div>
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={handleImport}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600
                       bg-canvas rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Upload size={12} /> Import
          </button>
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600
                       bg-canvas rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download size={12} /> Export
          </button>
        </div>
      </div>
    </aside>
  );
};
