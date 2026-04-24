import React, { useState } from "react";
import type { BFHLResponse, HierarchyObject } from "../types/bfhl";
import { TreeView } from "./TreeView";

function HierarchyCard({ h, index }: { h: HierarchyObject; index: number }) {
  const [open, setOpen] = useState(true);
  const isCyclic = !!h.has_cycle;

  return (
    <div className={`hierarchy-card ${isCyclic ? "cyclic" : "tree"}`}>
      <div className="hierarchy-header" onClick={() => setOpen((v) => !v)}>
        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
          #{index + 1}
        </span>
        <span className={`root-badge ${isCyclic ? "cycle-badge" : "tree-badge"}`}>
          {h.root}
        </span>
        <span style={{ fontSize: "0.8rem", color: isCyclic ? "var(--red)" : "var(--green)" }}>
          {isCyclic ? "Cyclic Group" : "Tree"}
        </span>
        <div className="hierarchy-meta">
          {isCyclic ? (
            <span className="cycle-pill">🔁 Cycle</span>
          ) : (
            <span className="depth-badge">depth {h.depth}</span>
          )}
          <span className={`chevron ${open ? "open" : ""}`}>▾</span>
        </div>
      </div>

      {open && (
        <div className="hierarchy-body">
          {isCyclic ? (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              Cycle detected — no tree structure available.
            </p>
          ) : (
            <TreeView tree={h.tree} depth={h.depth} />
          )}
        </div>
      )}
    </div>
  );
}

interface ResponsePanelProps {
  response: BFHLResponse | null;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ response }) => {
  const [showJson, setShowJson] = useState(false);

  if (!response) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-icon purple">📊</div>
          <span className="card-title">API Response</span>
        </div>
        <div className="response-panel">
          <div className="empty-state">
            <div className="empty-state-icon">🌳</div>
            <p>Submit node edges to visualise hierarchies</p>
          </div>
        </div>
      </div>
    );
  }

  const { summary, hierarchies, invalid_entries, duplicate_edges,
          user_id, email_id, college_roll_number } = response;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon green">✅</div>
        <span className="card-title">API Response</span>
        <button
          className="json-toggle"
          style={{ marginLeft: "auto" }}
          onClick={() => setShowJson((v) => !v)}
        >
          {showJson ? "Hide" : "Show"} JSON
        </button>
      </div>

      <div className="response-panel">

        {/* Identity strip */}
        <div className="identity-strip">
          <div className="identity-field">
            <span className="identity-label">User ID</span>
            <span className="identity-value">{user_id}</span>
          </div>
          <div className="identity-field">
            <span className="identity-label">Email</span>
            <span className="identity-value">{email_id}</span>
          </div>
          <div className="identity-field">
            <span className="identity-label">Roll No.</span>
            <span className="identity-value">{college_roll_number}</span>
          </div>
        </div>

        {/* Summary bar */}
        <div className="summary-bar" style={{ marginTop: 16 }}>
          <div className="summary-stat stat-trees">
            <div className="summary-stat-value">{summary.total_trees}</div>
            <div className="summary-stat-label">Trees</div>
          </div>
          <div className="summary-stat stat-cycles">
            <div className="summary-stat-value">{summary.total_cycles}</div>
            <div className="summary-stat-label">Cycles</div>
          </div>
          <div className="summary-stat stat-root">
            <div className="summary-stat-value">{summary.largest_tree_root || "—"}</div>
            <div className="summary-stat-label">Largest Root</div>
          </div>
        </div>

        {/* Hierarchies */}
        {hierarchies.length > 0 && (
          <div className="side-section">
            <div className="side-section-title">
              Hierarchies
              <span className="count-badge">{hierarchies.length}</span>
            </div>
            <div className="hierarchy-list">
              {hierarchies.map((h, i) => (
                <HierarchyCard key={h.root + i} h={h} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Invalid entries */}
        <div className="side-section">
          <div className="side-section-title">
            Invalid Entries
            <span className="count-badge">{invalid_entries.length}</span>
          </div>
          <div className="pill-list">
            {invalid_entries.length === 0 ? (
              <span className="pill empty">None</span>
            ) : (
              invalid_entries.map((e, i) => (
                <span key={i} className="pill invalid">{e || '""'}</span>
              ))
            )}
          </div>
        </div>

        {/* Duplicate edges */}
        <div className="side-section">
          <div className="side-section-title">
            Duplicate Edges
            <span className="count-badge">{duplicate_edges.length}</span>
          </div>
          <div className="pill-list">
            {duplicate_edges.length === 0 ? (
              <span className="pill empty">None</span>
            ) : (
              duplicate_edges.map((e, i) => (
                <span key={i} className="pill dup">{e}</span>
              ))
            )}
          </div>
        </div>

        {/* Raw JSON */}
        {showJson && (
          <pre className="json-block">
            {JSON.stringify(response, null, 2)}
          </pre>
        )}

      </div>
    </div>
  );
};
