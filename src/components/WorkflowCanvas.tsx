import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';
import { StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode } from './nodes/CustomNodes';
import { Play, Trash2 } from 'lucide-react';
import type { WorkflowNodeData } from '../types/workflow';
import type { Node } from 'reactflow';

const nodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedNode,
  end: EndNode,
};

const DEFAULT_DATA: Record<string, WorkflowNodeData> = {
  start: { nodeType: 'start', label: 'Start', title: 'New Workflow', metadata: [] },
  task: { nodeType: 'task', label: 'Task', title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] },
  approval: { nodeType: 'approval', label: 'Approval', title: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 0 },
  automated: { nodeType: 'automated', label: 'Automated Step', title: 'Automated Step', actionId: '', actionParams: {} },
  end: { nodeType: 'end', label: 'End', endMessage: 'Workflow completed.', summaryFlag: false },
};

let idCounter = 100;
const uid = () => `node-${++idCounter}`;

export const WorkflowCanvas: React.FC = () => {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNode, setSelectedNodeId,
    setSandboxOpen, setNodes, setEdges,
  } = useWorkflowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      const newNode: Node<WorkflowNodeData> = {
        id: uid(),
        type,
        position,
        data: { ...DEFAULT_DATA[type] },
      };

      addNode(newNode);
      setSelectedNodeId(newNode.id);
    },
    [reactFlowInstance, addNode, setSelectedNodeId]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => setSelectedNodeId(node.id),
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(
    () => setSelectedNodeId(null),
    [setSelectedNodeId]
  );

  const handleClearAll = () => {
    if (window.confirm('Clear all nodes and edges?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
    }
  };

  return (
    <div ref={reactFlowWrapper} className="flex-1 relative bg-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#94A3B8', strokeWidth: 2 },
          markerEnd: { type: 'arrowclosed' as any, color: '#94A3B8' },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="#CBD5E1"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              start: '#22C55E', task: '#4F6EF7',
              approval: '#F59E0B', automated: '#8B5CF6', end: '#EF4444',
            };
            return colors[n.type || ''] || '#94A3B8';
          }}
          nodeStrokeWidth={0}
          maskColor="rgba(244,245,247,0.6)"
          style={{ width: 140, height: 90 }}
        />

        {/* Top toolbar */}
        <Panel position="top-center">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-border rounded-2xl px-3 py-2 shadow-node">
            <span className="text-xs font-semibold text-gray-600 mr-1">
              {nodes.length > 0
                ? nodes.find(n => n.data.nodeType === 'start')
                  ? (nodes.find(n => n.data.nodeType === 'start')?.data as any)?.title || 'Untitled Workflow'
                  : 'Untitled Workflow'
                : 'Empty Canvas'}
            </span>
            <span className="w-px h-4 bg-border" />
            <button
              onClick={() => setSandboxOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white
                         bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
            >
              <Play size={11} fill="white" /> Test Workflow
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500
                         hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={11} /> Clear
            </button>
          </div>
        </Panel>

        {/* Hint when canvas is empty */}
        {nodes.length === 0 && (
          <Panel position="top-center" style={{ marginTop: 80 }}>
            <div className="text-center space-y-2 pointer-events-none select-none">
              <div className="text-4xl">✦</div>
              <div className="text-sm font-semibold text-gray-400">
                Drag nodes from the sidebar to build your workflow
              </div>
              <div className="text-xs text-gray-300">
                Connect them with edges · Click to configure · Delete key removes selection
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
