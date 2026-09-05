import { CATEGORIES, createCategoryQuery, INTENT_PRESETS } from '../data/marketplace';

export default function MandateBuilder({ intent, setIntent, bias, setBias, onRun, onSelectPreset, running, liveMode }) {
  const activePreset = INTENT_PRESETS.find(({ intent: preset }) => (
    preset.category === intent.category
    && preset.query === intent.query
    && preset.maxPrice === intent.maxPrice
    && preset.mustArriveBy === intent.mustArriveBy
    && preset.preference === intent.preference
    && preset.avoidSponsored === intent.avoidSponsored
    && preset.avoidPriceManipulation === intent.avoidPriceManipulation
  ))?.id;

  return (
    <section className="panel mandate">
      <div className="panel-eyebrow">01 — Mandate</div>
      <h2 className="panel-title">Your intent, on record</h2>
      <p className="panel-sub">
        This is what you're authorizing an agent to act on. Aegis audits every
        purchase against exactly this — nothing the agent claims later.
      </p>

      <div className="mandate-presets" aria-label="Mandate presets">
        <span className="preset-label mono">Try a scenario</span>
        <div className="preset-buttons">
          {INTENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`preset-btn ${activePreset === preset.id ? 'active' : ''}`}
              type="button"
              aria-pressed={activePreset === preset.id}
              onClick={() => {
                if (onSelectPreset) onSelectPreset(preset);
                else setIntent({ ...preset.intent });
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span>Product category</span>
        <select
          className="mono"
          value={intent.category}
          onChange={(e) => {
            const category = e.target.value;
            setIntent({
              ...intent,
              category,
              query: createCategoryQuery(category, intent.maxPrice, intent.mustArriveBy),
            });
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>

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

      <label className="field toggle">
        <input
          type="checkbox"
          checked={intent.avoidPriceManipulation}
          onChange={(e) => setIntent({ ...intent, avoidPriceManipulation: e.target.checked })}
        />
        <span>Refuse inflate-then-discount price manipulation</span>
      </label>

      <div className="divider" />

      {liveMode ? (
        <p className="hint">
          Live Agent Mode is on — a real Claude call will make the purchase
          decision. Its incentive to favor sponsored listings is instructed
          in the backend prompt, not dialed in here, so any bias you see is
          genuine model behavior.
        </p>
      ) : (
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
            This dial stands in for what a real platform's agent optimizes
            for internally, for offline demos without a deployed backend.
          </p>
        </div>
      )}

      <button className="run-btn" onClick={onRun} disabled={running}>
        {running ? 'Agent is shopping…' : 'Let the agent buy it'}
      </button>
    </section>
  );
}
