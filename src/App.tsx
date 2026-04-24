import React, { useState, useCallback } from "react";
import "./index.css";
import { postBFHL } from "./api/bfhl";
import type { BFHLResponse } from "./types/bfhl";
import { InputPanel } from "./components/InputPanel";
import { ResponsePanel } from "./components/ResponsePanel";

export default function App() {
  const [response, setResponse] = useState<BFHLResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (entries: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await postBFHL(entries);
      setResponse(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(`API Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            <div className="logo-icon">🔗</div>
            <span className="logo-text">
              BFHL <span>API</span>
            </span>
          </div>
          <span className="header-badge">POST /bfhl</span>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        {/* Hero */}
        <section className="hero">
          <div className="hero-eyebrow">SRM Full Stack Challenge</div>
          <h1>
            Hierarchy <span className="gradient-text">Graph Explorer</span>
          </h1>
          <p className="hero-sub">
            Enter node edges and instantly visualise the tree structure, detect cycles,
            and inspect detailed API insights.
          </p>
        </section>

        {/* Workspace */}
        <div className="workspace">
          <InputPanel onSubmit={handleSubmit} loading={loading} error={error} />
          <ResponsePanel response={response} />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        BFHL API · SRM Full Stack Engineering Challenge · Built with React + Express
      </footer>
    </div>
  );
}
