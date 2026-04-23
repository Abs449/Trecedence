import React, { useState } from 'react';
import { X, Play, CheckCircle, AlertCircle, AlertTriangle, Clock, Loader, ChevronRight } from 'lucide-react';
import { useWorkflowStore } from '../store/workflowStore';
import { simulateWorkflow } from '../api/mockApi';
import type { SimulationResult, SimulationStep } from '../types/workflow';

const STATUS_CONFIG = {
  success: { icon: <CheckCircle size={14} />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500' },
  warning: { icon: <AlertTriangle size={14} />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400' },
  error: { icon: <AlertCircle size={14} />, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  skipped: { icon: <Clock size={14} />, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-300' },
};

const NODE_TYPE_LABEL: Record<string, string> = {
  start: 'Start',
  task: 'Task',
  approval: 'Approval',
  automated: 'Automated',
  end: 'End',
};

const StepRow: React.FC<{ step: SimulationStep; index: number }> = ({ step, index }) => {
  const cfg = STATUS_CONFIG[step.status];
  return (
    <div
      className={`flex gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border} step-appear`}
      style={{ animationDelay: `${index * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
      {/* Step number + dot */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
        <div className={`w-5 h-5 rounded-full ${cfg.dot} flex items-center justify-center`}>
          <span className="text-[9px] font-bold text-white">{index + 1}</span>
        </div>
        {/* connector */}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>
            {NODE_TYPE_LABEL[step.nodeType] || step.nodeType}
          </span>
          <ChevronRight size={10} className="text-gray-300" />
          <span className="text-xs font-semibold text-gray-700 truncate">{step.label}</span>
          <span className={`ml-auto flex items-center gap-1 ${cfg.color} flex-shrink-0`}>
            {cfg.icon}
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-snug">{step.message}</p>
        <div className="text-[10px] text-gray-400 mt-1 font-mono">{step.timestamp}</div>
      </div>
    </div>
  );
};

export const SandboxPanel: React.FC = () => {
  const { nodes, edges, setSandboxOpen } = useWorkflowStore();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await simulateWorkflow(nodes as any, edges);
      setResult(res);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm fade-enter">
      <div
        className="bg-white rounded-2xl shadow-panel w-full max-w-lg max-h-[85vh] flex flex-col scale-enter overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-light rounded-xl flex items-center justify-center">
            <Play size={15} className="text-primary" fill="#4F6EF7" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800">Workflow Sandbox</div>
            <div className="text-xs text-muted">{nodes.length} nodes · {edges.length} connections</div>
          </div>
          <button
            onClick={() => setSandboxOpen(false)}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-canvas text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Workflow JSON preview */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Workflow Payload
            </div>
            <pre className="text-[10px] bg-gray-950 text-green-400 rounded-xl p-3 overflow-x-auto leading-relaxed font-mono max-h-32">
              {JSON.stringify(
                {
                  nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data })),
                  edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target })),
                },
                null,
                2
              )}
            </pre>
          </div>

          {/* Validation errors */}
          {result && result.errors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                <AlertCircle size={15} /> Validation Errors
              </div>
              {result.errors.map((e, i) => (
                <div key={i} className="text-xs text-red-600 flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">·</span>
                  {e}
                </div>
              ))}
            </div>
          )}

          {/* Execution steps */}
          {result && result.steps.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Execution Log
              </div>
              <div className="space-y-2">
                {result.steps.map((step, i) => (
                  <StepRow key={step.nodeId} step={step} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {result && (
            <div
              className={`rounded-xl border p-3 flex items-start gap-3 ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              {result.success ? (
                <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className={`text-sm font-semibold ${result.success ? 'text-green-800' : 'text-red-700'}`}>
                  {result.success ? 'Simulation Passed' : 'Simulation Failed'}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">{result.summary}</div>
              </div>
            </div>
          )}

          {running && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader size={24} className="text-primary animate-spin" />
              <div className="text-sm text-muted">Simulating workflow execution…</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex items-center gap-3">
          <button
            onClick={() => setSandboxOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-canvas rounded-xl hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="ml-auto flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary rounded-xl
                       hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {running ? (
              <><Loader size={14} className="animate-spin" /> Running…</>
            ) : (
              <><Play size={14} fill="white" /> Run Simulation</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
