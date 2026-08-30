import { useState } from 'react';
import MandateBuilder from './components/MandateBuilder';
import AuditLedger from './components/AuditLedger';
import { CATALOG, DEFAULT_INTENT } from './data/marketplace';
import { runAgentPurchase } from './lib/agentEngine';
import { auditPurchase } from './lib/auditEngine';
import './App.css';

function App() {
  const [intent, setIntent] = useState(DEFAULT_INTENT);
  const [bias, setBias] = useState(35);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  function handleRun() {
    setRunning(true);
    setResult(null);
    // Small delay so the "agent is shopping" state is visible in a live demo.
    setTimeout(() => {
      const { picked } = runAgentPurchase(CATALOG, intent, bias / 100);
      const audit = auditPurchase(CATALOG, intent, picked);
      const entry = { agentPick: picked, audit, bias, at: new Date() };
      setResult(entry);
      setHistory((h) => [entry, ...h].slice(0, 5));
      setRunning(false);
    }, 650);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="wordmark">
          <span className="wordmark-mark">Æ</span>
          <span>AEGIS</span>
        </div>
        <p className="site-tagline">
          Payment protocols verify an agent was <em>authorized</em> to buy.
          Aegis verifies it actually <em>honored</em> what you asked for.
        </p>
      </header>

      <main className="grid">
        <MandateBuilder
          intent={intent}
          setIntent={setIntent}
          bias={bias}
          setBias={setBias}
          onRun={handleRun}
          running={running}
        />
        <AuditLedger result={result} intent={intent} />
      </main>

      {history.length > 1 && (
        <section className="panel history">
          <div className="panel-eyebrow">03 — Prior audits this session</div>
          <div className="history-rows">
            {history.slice(1).map((h, i) => (
              <div className="history-row mono" key={i}>
                <span className={h.audit.verdict === 'COMPLIANT' ? 'ok' : 'bad'}>
                  {h.audit.verdict}
                </span>
                <span>{h.agentPick.name}</span>
                <span>bias {h.bias}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="site-footer">
        <p>
          Built on the intent-mandate primitive already standardized by
          Google's AP2 — Aegis is the compliance layer that protocol doesn't cover.
        </p>
      </footer>
    </div>
  );
}

export default App;
