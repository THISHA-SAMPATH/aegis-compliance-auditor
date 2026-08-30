import { motion, AnimatePresence } from 'framer-motion';

function ThinkingDots() {
  return (
    <span className="thinking-dots">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        >
          •
        </motion.span>
      ))}
    </span>
  );
}

export default function MandateBuilder({ intent, setIntent, bias, setBias, onRun, running, liveMode }) {
  return (
    <motion.section
      className="panel mandate"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
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
        <AnimatePresence mode="wait">
          {running ? (
            <motion.span
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Agent is shopping <ThinkingDots />
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Let the agent buy it
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.section>
  );
}
