import { motion, AnimatePresence } from 'framer-motion';

function Stamp({ verdict }) {
  const compliant = verdict === 'COMPLIANT';
  return (
    <motion.div
      key={verdict}
      className={`stamp ${compliant ? 'stamp-verified' : 'stamp-flagged'}`}
      initial={{ scale: 2.6, rotate: 0, opacity: 0 }}
      animate={{ scale: 1, rotate: -4, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 14, delay: 0.15 }}
    >
      <span>{compliant ? 'COMPLIANT' : 'FLAGGED'}</span>
    </motion.div>
  );
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

export default function AuditLedger({ result, intent }) {
  if (!result) {
    return (
      <motion.section
        className="panel ledger empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="panel-eyebrow">02 — Audit</div>
        <h2 className="panel-title">No purchase yet</h2>
        <p className="panel-sub">
          Set your mandate and run the agent. Aegis audits the outcome the
          moment the purchase completes — before you'd otherwise find out.
        </p>
      </motion.section>
    );
  }

  const { agentPick, audit } = result;

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={agentPick.id + audit.verdict}
        className="panel ledger"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="panel-eyebrow">02 — Audit</div>
        <div className="ledger-head">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="panel-title">{agentPick.name}</h2>
            <p className="panel-sub">
              {agentPick.brand} · ${agentPick.price} · purchased by the agent
              {agentPick.sponsored ? ' · sponsored listing' : ''}
            </p>
          </motion.div>
          <Stamp verdict={audit.verdict} />
        </div>

        {audit.agentReasoning && (
          <motion.div
            className="agent-quote"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            <div className="panel-eyebrow">What the agent told the user</div>
            <p>&ldquo;{audit.agentReasoning}&rdquo;</p>
          </motion.div>
        )}

        <motion.ul
          className="evidence"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {audit.evidence.map((e, i) => (
            <motion.li key={i} className={e.ok ? 'ok' : 'bad'} variants={itemVariants}>
              <span className="evidence-mark mono">{e.ok ? 'PASS' : 'FAIL'}</span>
              <div>
                <div className="evidence-label">{e.label}</div>
                <div className="evidence-detail">{e.detail}</div>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {audit.verdict === 'FLAGGED' && audit.honestBest && audit.honestBest.id !== agentPick.id && (
          <motion.div
            className="counterfactual"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 + audit.evidence.length * 0.09 }}
          >
            <div className="panel-eyebrow">What Aegis would have picked</div>
            <div className="counterfactual-row">
              <strong>{audit.honestBest.name}</strong>
              <span className="mono">${audit.honestBest.price} · fit {(audit.honestBest.matchScore * 100).toFixed(0)}%</span>
            </div>
          </motion.div>
        )}
      </motion.section>
    </AnimatePresence>
  );
}
