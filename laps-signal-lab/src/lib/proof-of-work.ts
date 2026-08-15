// Client half of the server-issued proof-of-work challenge.
//
// The server (ProofOfWorkService) mints a nonce and requires a `solution`
// string such that SHA-256("<nonce>:<solution>") begins with `difficultyBits`
// zero bits. Finding one costs work; checking one costs a single hash. That
// asymmetry is the whole mechanism — it prices automated login attempts without
// sending anything to a third party.
//
// SHA-256 is implemented here rather than via crypto.subtle because the search
// needs hundreds of thousands of hashes and subtle.digest is promise-based:
// the per-call overhead dominates and turns a 200ms search into several
// seconds. The digest below is byte-identical to the server's — the round trip
// is covered by proof-of-work.test.

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const INIT = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

/** SHA-256 of a byte array, returned as 32 bytes. */
export function sha256(bytes: Uint8Array): Uint8Array {
  const bitLen = bytes.length * 8;
  // message + 0x80 + zero padding + 8-byte big-endian length, rounded up to a
  // 64-byte multiple. Round up rather than "divide then add a block": when
  // len + 9 lands exactly on a block boundary (len % 64 === 55) the extra block
  // is wrong, and splits the 0x80 from the length field into separate blocks.
  const paddedLen = ((bytes.length + 72) >> 6) << 6;
  const buf = new Uint8Array(paddedLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;

  const view = new DataView(buf.buffer);
  // Lengths here never approach 2^32 bits, so the high word is always zero.
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 4294967296), false);

  const h = new Uint32Array(INIT);
  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, hh] = h;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      hh = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) outView.setUint32(i * 4, h[i], false);
  return out;
}

export function sha256Hex(input: string): string {
  return Array.from(sha256(new TextEncoder().encode(input)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Number of leading zero bits in the digest. Mirrors ProofOfWorkService.leadingZeroBits. */
export function leadingZeroBits(nonce: string, solution: string): number {
  const digest = sha256(new TextEncoder().encode(`${nonce}:${solution}`));
  let zeros = 0;
  for (const byte of digest) {
    if (byte === 0) {
      zeros += 8;
      continue;
    }
    zeros += Math.clz32(byte) - 24;
    break;
  }
  return zeros;
}

export interface Challenge {
  nonce: string;
  difficultyBits: number;
  expiresInSeconds: number;
}

/**
 * Searches for a solution to `challenge`. Yields to the event loop periodically
 * so the login button's pending state can actually paint — at difficulty 16 the
 * search is short, but on a slow phone it is long enough to feel like a freeze
 * if the main thread never comes up for air.
 */
export async function solveChallenge(challenge: Challenge): Promise<string> {
  const { nonce, difficultyBits } = challenge;
  const YIELD_EVERY = 20_000;
  // Generous: at difficulty 16 the expected count is ~65k, so this is ~150x the
  // mean. Hitting it means the difficulty is misconfigured, and failing loudly
  // beats spinning forever behind a stuck spinner.
  const MAX_ATTEMPTS = 10_000_000;

  for (let counter = 0; counter < MAX_ATTEMPTS; counter++) {
    const candidate = counter.toString(36);
    if (leadingZeroBits(nonce, candidate) >= difficultyBits) {
      return candidate;
    }
    if (counter > 0 && counter % YIELD_EVERY === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  throw new Error(`No proof-of-work solution found for difficulty ${difficultyBits}`);
}
