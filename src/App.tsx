import React from 'react';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { Sidebar } from './components/Sidebar';
import { NodeConfigPanel } from './components/NodeConfigPanel';
import { SandboxPanel } from './components/SandboxPanel';
import { useWorkflowStore } from './store/workflowStore';

const App: React.FC = () => {
  const { sandboxOpen, setSandboxOpen } = useWorkflowStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <WorkflowCanvas />
      </main>
      <NodeConfigPanel />
      {sandboxOpen && (
        <div onClick={() => setSandboxOpen(false)}>
          <SandboxPanel />
        </div>
      )}
    </div>
  );
};

export default App;
