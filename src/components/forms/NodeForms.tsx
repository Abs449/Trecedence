import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import { getAutomations } from '../../api/mockApi';
import type {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedNodeData,
  EndNodeData,
  AutomationAction,
} from '../../types/workflow';
import { Field, TextInput, Textarea, Select, Toggle, KVEditor, Section } from './FormPrimitives';

// ─── Start Node Form ──────────────────────────────────────────
export const StartNodeForm: React.FC<{ id: string; data: StartNodeData }> = ({ id, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);
  return (
    <div className="space-y-4">
      <Section title="Configuration">
        <Field label="Workflow Title" required>
          <TextInput
            value={data.title}
            onChange={e => update(id, { title: e.target.value, label: e.target.value } as any)}
            placeholder="e.g. Employee Onboarding"
          />
        </Field>
      </Section>
      <Section title="Metadata">
        <KVEditor
          items={data.metadata || []}
          onChange={v => update(id, { metadata: v } as any)}
          keyPlaceholder="e.g. department"
          valuePlaceholder="e.g. Engineering"
        />
      </Section>
    </div>
  );
};

// ─── Task Node Form ───────────────────────────────────────────
export const TaskNodeForm: React.FC<{ id: string; data: TaskNodeData }> = ({ id, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);
  return (
    <div className="space-y-4">
      <Section title="Task Details">
        <Field label="Title" required>
          <TextInput
            value={data.title}
            onChange={e => update(id, { title: e.target.value, label: e.target.value } as any)}
            placeholder="e.g. Collect Documents"
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={data.description}
            onChange={e => update(id, { description: e.target.value } as any)}
            placeholder="Describe what needs to be done..."
          />
        </Field>
      </Section>
      <Section title="Assignment">
        <Field label="Assignee">
          <TextInput
            value={data.assignee}
            onChange={e => update(id, { assignee: e.target.value } as any)}
            placeholder="e.g. HR Manager or john@company.com"
          />
        </Field>
        <Field label="Due Date">
          <TextInput
            type="date"
            value={data.dueDate}
            onChange={e => update(id, { dueDate: e.target.value } as any)}
          />
        </Field>
      </Section>
      <Section title="Custom Fields">
        <KVEditor
          items={data.customFields || []}
          onChange={v => update(id, { customFields: v } as any)}
        />
      </Section>
    </div>
  );
};

// ─── Approval Node Form ───────────────────────────────────────
const APPROVER_ROLES = [
  { value: 'Manager', label: 'Manager' },
  { value: 'HRBP', label: 'HRBP' },
  { value: 'Director', label: 'Director' },
  { value: 'C-Suite', label: 'C-Suite' },
  { value: 'Legal', label: 'Legal' },
];

export const ApprovalNodeForm: React.FC<{ id: string; data: ApprovalNodeData }> = ({ id, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);
  return (
    <div className="space-y-4">
      <Section title="Approval Configuration">
        <Field label="Step Title" required>
          <TextInput
            value={data.title}
            onChange={e => update(id, { title: e.target.value, label: e.target.value } as any)}
            placeholder="e.g. Manager Approval"
          />
        </Field>
        <Field label="Approver Role">
          <Select
            value={data.approverRole}
            onChange={e => update(id, { approverRole: e.target.value } as any)}
            options={APPROVER_ROLES}
            placeholder="Select a role..."
          />
        </Field>
      </Section>
      <Section title="Auto-Approval">
        <Field label="Auto-Approve Threshold (%)">
          <div className="space-y-2">
            <TextInput
              type="number"
              min={0}
              max={100}
              value={data.autoApproveThreshold}
              onChange={e => update(id, { autoApproveThreshold: Number(e.target.value) } as any)}
              placeholder="0 = disabled"
            />
            {data.autoApproveThreshold > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-lg">
                Requests at or below {data.autoApproveThreshold}% will be auto-approved.
              </p>
            )}
          </div>
        </Field>
      </Section>
    </div>
  );
};

// ─── Automated Node Form ──────────────────────────────────────
export const AutomatedNodeForm: React.FC<{ id: string; data: AutomatedNodeData }> = ({ id, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);
  const [actions, setActions] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutomations().then(a => { setActions(a); setLoading(false); });
  }, []);

  const selectedAction = actions.find(a => a.id === data.actionId);

  const handleActionChange = (actionId: string) => {
    update(id, { actionId, actionParams: {} } as any);
  };

  const handleParamChange = (param: string, value: string) => {
    update(id, {
      actionParams: { ...(data.actionParams || {}), [param]: value },
    } as any);
  };

  return (
    <div className="space-y-4">
      <Section title="Step Configuration">
        <Field label="Step Title" required>
          <TextInput
            value={data.title}
            onChange={e => update(id, { title: e.target.value, label: e.target.value } as any)}
            placeholder="e.g. Send Welcome Email"
          />
        </Field>
        <Field label="Action">
          {loading ? (
            <div className="text-xs text-muted animate-pulse">Loading actions…</div>
          ) : (
            <Select
              value={data.actionId || ''}
              onChange={e => handleActionChange(e.target.value)}
              options={actions.map(a => ({ value: a.id, label: a.label }))}
              placeholder="Select an action..."
            />
          )}
        </Field>
      </Section>

      {selectedAction && selectedAction.params.length > 0 && (
        <Section title="Action Parameters">
          {selectedAction.params.map(param => (
            <Field key={param} label={param.replace(/_/g, ' ')}>
              <TextInput
                value={data.actionParams?.[param] || ''}
                onChange={e => handleParamChange(param, e.target.value)}
                placeholder={`Enter ${param}...`}
              />
            </Field>
          ))}
        </Section>
      )}
    </div>
  );
};

// ─── End Node Form ────────────────────────────────────────────
export const EndNodeForm: React.FC<{ id: string; data: EndNodeData }> = ({ id, data }) => {
  const update = useWorkflowStore(s => s.updateNodeData);
  return (
    <div className="space-y-4">
      <Section title="Completion">
        <Field label="End Message">
          <Textarea
            value={data.endMessage}
            onChange={e => update(id, { endMessage: e.target.value } as any)}
            placeholder="e.g. Onboarding process completed successfully."
          />
        </Field>
        <Toggle
          checked={data.summaryFlag}
          onChange={v => update(id, { summaryFlag: v } as any)}
          label="Generate workflow summary report"
        />
      </Section>
    </div>
  );
};
