// Shapes the user's stated intent as an AP2-style Intent Mandate:
// a signed Verifiable-Credential-like envelope around the actual
// constraints, matching the structure AP2 already standardizes
// (issuer, credentialSubject with constraints, timestamp, proof).
//
// The signature here is a mock (a hash stand-in, not real cryptography) —
// there is no user wallet/key infra in this demo — but the shape is real,
// so wiring in an actual AP2 client library later is a swap, not a rewrite.

function mockSign(payload) {
  // Stand-in for a real detached JWS/proof. Deterministic so the same
  // mandate always "signs" the same way in this demo.
  let hash = 0;
  const str = JSON.stringify(payload);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `mock-sig-${Math.abs(hash).toString(16)}`;
}

export function buildIntentMandate(intent, userId = 'user-thisha-demo') {
  const credentialSubject = {
    id: userId,
    intent: intent.query,
    constraints: {
      category: intent.category,
      maxPrice: intent.maxPrice,
      currency: 'USD',
      mustArriveBy: intent.mustArriveBy,
      preference: intent.preference,
      avoidSponsored: intent.avoidSponsored,
    },
  };

  const mandate = {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'https://ap2.dev/contexts/intent-mandate/v1'],
    type: ['VerifiableCredential', 'IntentMandate'],
    issuer: userId,
    issuanceDate: new Date().toISOString(),
    credentialSubject,
  };

  return {
    ...mandate,
    proof: {
      type: 'MockEd25519Signature2026',
      created: mandate.issuanceDate,
      proofValue: mockSign(credentialSubject),
    },
  };
}
