import { useState } from 'react';

function Stamp({ verdict }) {
  const stampClass = {
    COMPLIANT: 'stamp-verified',
    MINOR_DEVIATION: 'stamp-minor',
    FLAGGED: 'stamp-flagged',
  }[verdict] || 'stamp-flagged';

  const label = verdict === 'MINOR_DEVIATION' ? 'MINOR DEVIATION' : verdict;

  return (
    <div className={`stamp ${stampClass}`}>
      <span>{label}</span>
    </div>
  );
}

function buildAuditSummary(agentPick, audit) {
  const lines = [
    'Aegis audit summary',
    `Product: ${agentPick.name} (${agentPick.brand}) — $${agentPick.price}`,
    `Verdict: ${audit.verdict}`,
    '',
    'Evidence:',
    ...audit.evidence.map(
      (evidence) => `- ${evidence.ok ? 'PASS' : 'FAIL'}: ${evidence.label} — ${evidence.detail}`,
    ),
  ];

  if (audit.verdict === 'FLAGGED' && audit.honestBest && audit.honestBest.id !== agentPick.id) {
    lines.push(
      '',
      `Aegis counterfactual: ${audit.honestBest.name} — $${audit.honestBest.price} (fit ${(audit.honestBest.matchScore * 100).toFixed(0)}%)`,
    );
  }

  return lines.join('\n');
}

export default function AuditLedger({ result, intent, isViewingPastResult, onBackToLatest }) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <section className="panel ledger empty">
        <div className="panel-eyebrow">02 — Audit</div>
        <h2 className="panel-title">No purchase yet</h2>
        <p className="panel-sub">
          Set your mandate and run the agent. Aegis audits the outcome the
          moment the purchase completes — before you'd otherwise find out.
        </p>
      </section>
    );
  }

  const { agentPick, audit } = result;

  async function handleCopySummary() {
    try {
      await navigator.clipboard.writeText(buildAuditSummary(agentPick, audit));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="panel ledger">
      <div className="panel-eyebrow">02 — Audit</div>
      {isViewingPastResult && (
        <div className="past-result-notice">
          <span className="mono">Viewing past result</span>
          <button type="button" onClick={onBackToLatest}>Back to latest</button>
        </div>
      )}
      <div className="ledger-head">
        <div>
          <h2 className="panel-title">{agentPick.name}</h2>
          <p className="panel-sub">
            {agentPick.brand} · ${agentPick.price} · purchased by the agent
            {agentPick.sponsored ? ' · sponsored listing' : ''}
          </p>
        </div>
        <div className="audit-actions">
          <button className="copy-summary-btn" type="button" onClick={handleCopySummary}>
            {copied ? 'Copied' : 'Copy audit summary'}
          </button>
          <Stamp verdict={audit.verdict} />
        </div>
      </div>

      {audit.agentReasoning && (
        <div className="agent-quote">
          <div className="panel-eyebrow">What the agent told the user</div>
          <p>&ldquo;{audit.agentReasoning}&rdquo;</p>
        </div>
      )}

      <ul className="evidence">
        {audit.evidence.map((e, i) => (
          <li key={i} className={e.ok ? 'ok' : 'bad'}>
            <span className="evidence-mark mono">{e.ok ? 'PASS' : 'FAIL'}</span>
            <div>
              <div className="evidence-label">{e.label}</div>
              <div className="evidence-detail">{e.detail}</div>
            </div>
          </li>
        ))}
      </ul>

      {audit.verdict !== 'COMPLIANT' && audit.honestBest && audit.honestBest.id !== agentPick.id && (
        <div className="counterfactual">
          <div className="panel-eyebrow">What Aegis would have picked</div>
          <div className="counterfactual-row">
            <strong>{audit.honestBest.name}</strong>
            <span className="mono">${audit.honestBest.price} · fit {(audit.honestBest.matchScore * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}
    </section>
  );
}
