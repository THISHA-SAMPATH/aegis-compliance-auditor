export default function MandateBuilder({ intent, setIntent, bias, setBias, onRun, running }) {
  return (
    <section className="panel mandate">
      <div className="panel-eyebrow">01 — Mandate</div>
      <h2 className="panel-title">Your intent, on record</h2>
      <p className="panel-sub">
        This is what you're authorizing an agent to act on. Aegis audits every
        purchase against exactly this — nothing the agent claims later.
      </p>

      <label className="field">
        <span>Shopping intent</span>
        <input
          className="mono"
          value={intent.query}
          onChange={(e) => setIntent({ ...intent, query: e.target.value })}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Max price ($)</span>
          <input
            type="number"
            className="mono"
            value={intent.maxPrice}
            onChange={(e) => setIntent({ ...intent, maxPrice: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Must arrive by</span>
          <select
            className="mono"
            value={intent.mustArriveBy}
            onChange={(e) => setIntent({ ...intent, mustArriveBy: e.target.value })}
          >
            <option value="ships-fri">Friday</option>
            <option value="ships-mon">Monday</option>
            <option value="ships-sat">Saturday</option>
          </select>
        </label>
      </div>

      <label className="field toggle">
        <input
          type="checkbox"
          checked={intent.avoidSponsored}
          onChange={(e) => setIntent({ ...intent, avoidSponsored: e.target.checked })}
        />
        <span>Never let sponsored listings win on my behalf</span>
      </label>

      <div className="divider" />

      <div className="field">
        <span>Simulated platform incentive strength</span>
        <input
          type="range"
          min="0"
          max="100"
          value={bias}
          onChange={(e) => setBias(Number(e.target.value))}
        />
        <div className="bias-readout mono">
          {bias}% — {bias < 20 ? 'mostly neutral agent' : bias < 60 ? 'moderately incentive-driven' : 'heavily incentive-driven'}
        </div>
        <p className="hint">
          This dial stands in for what a real platform's agent optimizes for
          internally. You can't see this number in production — Aegis infers
          the effect of it from the purchase alone.
        </p>
      </div>

      <button className="run-btn" onClick={onRun} disabled={running}>
        {running ? 'Agent is shopping…' : 'Let the agent buy it'}
      </button>
    </section>
  );
}
