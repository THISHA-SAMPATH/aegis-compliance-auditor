import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MandateBuilder from './components/MandateBuilder';
import AuditLedger from './components/AuditLedger';
import { CATALOG, DEFAULT_INTENT } from './data/marketplace';
import { runAgentPurchase } from './lib/agentEngine';
import { auditPurchase } from './lib/auditEngine';
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

function App() {
  const [intent, setIntent] = useState(DEFAULT_INTENT);
  const [bias, setBias] = useState(35);
  const [liveMode, setLiveMode] = useState(false);
  const [running, setRunning] = useState(false);
  const [statusNote, setStatusNote] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  }, [history]);

  async function handleRun() {
    setRunning(true);
    setResult(null);
    setStatusNote(null);

    const mandate = buildIntentMandate(intent);
    const eligible = CATALOG.filter(
      (p) => p.category === intent.category && p.price <= intent.maxPrice
    );

    let picked;
    let reasoning = null;
    let mode = 'simulated';

    if (liveMode) {
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
      const sim = runAgentPurchase(CATALOG, intent, bias / 100);
      picked = sim.picked;
    }

    const audit = auditPurchase(CATALOG, intent, picked, reasoning);
    const entry = { agentPick: picked, audit, bias, mode, mandate, at: new Date().toISOString() };
    setResult(entry);
    setHistory((h) => [entry, ...h].slice(0, 20));
    setRunning(false);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <motion.div
          className="wordmark"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="wordmark-mark">Æ</span>
          <span>AEGIS</span>
        </motion.div>
        <motion.p
          className="site-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Payment protocols verify an agent was <em>authorized</em> to buy.
          Aegis verifies it actually <em>honored</em> what you asked for.
        </motion.p>
        <motion.label
          className="mode-toggle mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <input
            type="checkbox"
            checked={liveMode}
            onChange={(e) => setLiveMode(e.target.checked)}
          />
          Live Agent Mode — let a real Claude call make the purchase decision
        </motion.label>
      </header>

      <main className="grid">
        <MandateBuilder
          intent={intent}
          setIntent={setIntent}
          bias={bias}
          setBias={setBias}
          onRun={handleRun}
          running={running}
          liveMode={liveMode}
        />
        <div>
          {statusNote && <div className="status-note mono">{statusNote}</div>}
          <AuditLedger result={result} intent={intent} />
        </div>
      </main>

      {history.length > 1 && (
        <section className="panel history">
          <div className="panel-eyebrow">03 — Audit trail (persisted locally)</div>
          <div className="history-rows">
            {history.slice(1).map((h, i) => (
              <div className="history-row mono" key={i}>
                <span className={h.audit.verdict === 'COMPLIANT' ? 'ok' : 'bad'}>
                  {h.audit.verdict}
                </span>
                <span>{h.agentPick.name}</span>
                <span>{h.mode === 'live' ? 'live agent' : `sim bias ${h.bias}%`}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="site-footer">
        <p>
          Mandates are shaped as AP2-style Intent Mandates — Aegis is built
          to sit on top of that existing infrastructure, not replace it.
        </p>
      </footer>
    </div>
  );
}

export default App;
