import { useState, useEffect } from 'react';
import MandateBuilder from './components/MandateBuilder';
import AuditLedger from './components/AuditLedger';
import { CATALOG, DEFAULT_INTENT } from './data/marketplace';
import { runAgentPurchase } from './lib/agentEngine';
import { auditPurchase, computeIntegrityScore, priceIsInflatedThenDiscounted } from './lib/auditEngine';
import { buildIntentMandate } from './lib/ap2';
import { fetchLiveAgentPick } from './lib/liveAgent';
import './App.css';

const HISTORY_KEY = 'aegis-audit-history-v1';

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatRelativeTime(timestamp) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000),
  );

  if (elapsedSeconds < 60) return 'just now';

  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return `${Math.floor(days / 7)}w ago`;
}

function buildComplianceTrend(history, windowSize = 5) {
  const chronological = [...history].reverse();

  const rates = chronological.map((entry, index) => {
    const windowStart = Math.max(0, index - windowSize + 1);
    const window = chronological.slice(windowStart, index + 1);
    const compliant = window.filter(
      (audit) => audit?.audit?.verdict === 'COMPLIANT',
    ).length;
    return (compliant / window.length) * 100;
  });

  const width = 120;
  const height = 32;
  const padding = 3;
  const points = rates.map((rate, index) => {
    const x = rates.length === 1
      ? width / 2
      : padding + (index / (rates.length - 1)) * (width - padding * 2);
    const y = padding + ((100 - rate) / 100) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return {
    points,
    latestRate: rates.at(-1) ?? 0,
    improving: rates.length < 2 || rates.at(-1) >= rates[0],
  };
}

function App() {
  const [intent, setIntent] = useState(DEFAULT_INTENT);
  const [bias, setBias] = useState(35);
  const [liveMode, setLiveMode] = useState(false);
  const [running, setRunning] = useState(false);
  const [statusNote, setStatusNote] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const integrityScore = computeIntegrityScore(history);
  const complianceTrend = buildComplianceTrend(history);
  const isViewingPastResult = Boolean(result && history[0] && result !== history[0]);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
    } else {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, [history]);

  function handleClearHistory() {
    if (!window.confirm('Clear all saved audit history?')) return;

    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
    setResult(null);
  }

  async function handleRun(intentToRun = intent, demo = null) {
    setRunning(true);
    setResult(null);
    setStatusNote(null);

    const mandate = buildIntentMandate(intentToRun);
    const eligible = CATALOG.filter(
      (p) => p.category === intentToRun.category
        && p.price <= intentToRun.maxPrice
        && (!intentToRun.avoidPriceManipulation || !priceIsInflatedThenDiscounted(p))
    );

    let picked;
    let reasoning = null;
    let mode = 'simulated';

    if (demo?.agentPickId) {
      picked = eligible.find((product) => product.id === demo.agentPickId);
      reasoning = demo.agentReasoning;
      mode = 'pitch demo';
    } else if (liveMode) {
      try {
        const live = await fetchLiveAgentPick(mandate, eligible);
        picked = eligible.find((p) => p.id === live.pickedId) || eligible[0];
        reasoning = live.reasoning;
        mode = 'live';
      } catch (err) {
        setStatusNote(`Live agent unavailable (${err.message}) — fell back to simulated agent.`);
      }
    }

    if (!picked) {
      const sim = runAgentPurchase(CATALOG, intentToRun, bias / 100);
      picked = sim.picked;
    }

    const audit = auditPurchase(CATALOG, intentToRun, picked, reasoning);
    const entry = { agentPick: picked, audit, bias, mode, mandate, at: new Date().toISOString() };
    setResult(entry);
    setHistory((h) => [entry, ...h].slice(0, 20));
    setRunning(false);
  }

  function handleSelectPreset(preset) {
    setIntent({ ...preset.intent });
    if (preset.demo?.autoRun) {
      setBias(preset.demo.bias ?? bias);
      handleRun(preset.intent, preset.demo);
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="site-nav" aria-label="Primary navigation">
          <span className="active">Mandate</span>
          <span>Audit</span>
          <span>Integrity</span>
          <span>History</span>
        </nav>
        <span className="header-status mono">Verification ready</span>
        <div className="wordmark">
          <span className="wordmark-mark" aria-hidden="true">A</span>
          <span>AEGIS</span>
        </div>
        <p className="site-tagline">Payment protocols verify an agent was <em>authorized</em> to buy.<br />Aegis verifies it actually <em>honored</em> what you asked for.</p>
        <p className="hero-copy">Aegis makes autonomous purchases accountable. Set a mandate, let an agent act, and get independent proof that it followed your rules.</p>
        <label className="mode-toggle mono">
          <input
            type="checkbox"
            checked={liveMode}
            onChange={(e) => setLiveMode(e.target.checked)}
          />
          Live Agent Mode — let a real Claude call make the purchase decision
        </label>
        <div className="hero-cta-row">
          <a className="hero-primary" href="#mandate">Create a mandate <span>→</span></a>
          <a className="hero-secondary" href="#how-it-works">How it works</a>
        </div>
        <div className="hero-shapes" aria-hidden="true">
          <span className="shape shape-blue" />
          <span className="shape shape-green" />
          <span className="shape shape-pink" />
          <span className="shape shape-yellow" />
          <div className="hero-preview">
            <div className="preview-bar"><span /> <span /> <span /></div>
            <div className="preview-body">
              <div className="preview-rail"><i /><i /><i /><i /></div>
              <div className="preview-content">
                <div className="preview-kicker">Purchase audit</div>
                <div className="preview-heading"><strong>Noise-cancelling<br />headphones</strong><b>COMPLIANT</b></div>
                <div className="preview-metrics"><span><i>96</i> mandate match</span><span><i>0</i> hidden incentives</span></div>
                <div className="preview-lines"><b /><b /><b /></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="trust-ticker" aria-label="Aegis safeguards">
        <span>Intent verified</span><span>Independent evidence</span><span>Incentives revealed</span>
        <span>Purchase audit trail</span><span>Intent verified</span><span>Independent evidence</span>
      </div>

      <main className="grid" id="mandate">
        <MandateBuilder
          intent={intent}
          setIntent={setIntent}
          bias={bias}
          setBias={setBias}
          onRun={handleRun}
          onSelectPreset={handleSelectPreset}
          running={running}
          liveMode={liveMode}
        />
        <div>
          {statusNote && <div className="status-note mono">{statusNote}</div>}
          <AuditLedger
            result={result}
            intent={intent}
            isViewingPastResult={isViewingPastResult}
            onBackToLatest={() => setResult(history[0])}
          />
        </div>
      </main>

      {history.length >= 3 && (
        <section className="panel integrity-score" aria-label="Agent Integrity Score">
          <div>
            <div className="panel-eyebrow">Agent integrity score</div>
            <p className="integrity-label">{integrityScore.label}</p>
          </div>
          <div className="integrity-value">
            <strong>{integrityScore.percentage}%</strong>
            <span className="mono">{history.length} audits</span>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section
          className={`compliance-trend ${complianceTrend.improving ? 'improving' : 'worsening'}`}
          aria-label={`Rolling compliant rate: ${Math.round(complianceTrend.latestRate)} percent`}
        >
          <div>
            <p className="trend-label mono">Rolling compliant rate</p>
            <p className="trend-value">{Math.round(complianceTrend.latestRate)}% <span>up to 5 audits</span></p>
          </div>
          <svg className="trend-sparkline" viewBox="0 0 120 32" role="img" aria-label="Compliance rate from oldest to newest audit">
            <polyline points={complianceTrend.points} fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
        </section>
      )}

      {history.length > 0 && (
        <section className="panel history">
          <div className="history-head">
          <div className="panel-eyebrow">03 — Audit trail (persisted locally)</div>
            <button className="clear-history-btn" type="button" onClick={handleClearHistory}>
              Clear history
            </button>
          </div>
          <div className="history-rows">
            {history.slice(1).map((h, i) => (
              <button
                className="history-row mono"
                key={i}
                type="button"
                onClick={() => setResult(h)}
              >
                <span className={
                  h.audit.verdict === 'COMPLIANT'
                    ? 'ok'
                    : h.audit.verdict === 'MINOR_DEVIATION'
                      ? 'minor'
                      : 'bad'
                }>
                  {h.audit.verdict}
                </span>
                <span>{h.agentPick.name}</span>
                <span>
                  {h.mode === 'live'
                    ? 'live agent'
                    : h.mode === 'pitch demo'
                      ? 'pitch demo'
                      : `sim bias ${h.bias}%`}
                </span>
                <span className="history-time mono">{formatRelativeTime(h.at)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <footer className="site-footer" id="how-it-works">
        <p>
          Mandates are shaped as AP2-style Intent Mandates — Aegis is built
          to sit on top of that existing infrastructure, not replace it.
        </p>
      </footer>
    </div>
  );
}

export default App;
