import React, { useState, useCallback } from "react";

const EXAMPLE_PRESETS = {
  "Full Example": [
    "A->B", "A->C", "B->D", "C->E", "E->F",
    "X->Y", "Y->Z", "Z->X",
    "P->Q", "Q->R",
    "G->H", "G->H", "G->I",
    "hello", "1->2", "A->",
  ],
  "Simple Tree": ["A->B", "A->C", "B->D", "C->E"],
  "Pure Cycle": ["A->B", "B->C", "C->A"],
  "Diamond": ["A->B", "A->C", "B->D", "C->D"],
};

interface InputPanelProps {
  onSubmit: (entries: string[]) => void;
  loading: boolean;
  error: string | null;
}

function classifyChip(entry: string): "valid" | "invalid" | "dup" {
  const t = entry.trim();
  if (!/^[A-Z]->[A-Z]$/.test(t)) return "invalid";
  const [a, b] = t.split("->");
  if (a === b) return "invalid";
  return "valid";
}

export const InputPanel: React.FC<InputPanelProps> = ({ onSubmit, loading, error }) => {
  const [raw, setRaw] = useState("");

  const entries = raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Mark duplicates
  const seen = new Set<string>();
  const classified = entries.map((e) => {
    const cls = classifyChip(e);
    if (cls === "valid") {
      if (seen.has(e)) return { entry: e, cls: "dup" as const };
      seen.add(e);
    }
    return { entry: e, cls };
  });

  const handleSubmit = useCallback(() => {
    if (!raw.trim() || loading) return;
    onSubmit(entries);
  }, [raw, entries, loading, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  const loadPreset = (key: keyof typeof EXAMPLE_PRESETS) => {
    setRaw(EXAMPLE_PRESETS[key].join("\n"));
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon blue">🌐</div>
        <span className="card-title">Input Nodes</span>
      </div>
      <div className="input-panel">
        {/* Quick fill */}
        <div className="quick-fill-row">
          {(Object.keys(EXAMPLE_PRESETS) as (keyof typeof EXAMPLE_PRESETS)[]).map((k) => (
            <button key={k} className="quick-fill-btn" onClick={() => loadPreset(k)}>
              {k}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div style={{ marginTop: 14 }}>
          <div className="input-label">
            Node edges
            <span className="input-hint">one per line, or comma-separated</span>
          </div>
          <textarea
            id="node-input"
            className="node-input"
            placeholder={"A->B\nA->C\nB->D\nX->Y\nhello"}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
        </div>

        {/* Live chips */}
        {classified.length > 0 && (
          <div className="chip-preview">
            {classified.map(({ entry, cls }, i) => (
              <span key={i} className={`chip ${cls}`}>
                {entry}
              </span>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          id="submit-btn"
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !raw.trim()}
        >
          {loading ? (
            <>
              <div className="spinner" />
              Processing…
            </>
          ) : (
            <>
              <span>⚡</span>
              Submit to /bfhl
            </>
          )}
        </button>

        <p style={{ marginTop: 10, fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>
          Ctrl+Enter to submit • {classified.length} entries
        </p>
      </div>
    </div>
  );
};
