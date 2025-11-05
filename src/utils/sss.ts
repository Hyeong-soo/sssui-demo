import * as sss from "sssui_wasm";

export type Curve = "secp256k1" | "secp256r1" | "ed25519";

type RandomSource = Pick<Crypto, "getRandomValues">;

const ED25519_ORDER_BE = Uint8Array.from([
  0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x14, 0xde, 0xf9, 0xde, 0xa2, 0xf7, 0x9c, 0xd6, 0x58, 0x12, 0x63, 0x1a, 0x5c, 0xf5, 0xd3, 0xed,
]);

const ED25519_ORDER_LE = Uint8Array.from([
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2, 0xde, 0xf9, 0xde, 0x14,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10,
]);

let randomSource: RandomSource | null = null;

function getRandomSource(): RandomSource {
  if (randomSource) return randomSource;
  const globalCrypto = typeof globalThis !== "undefined" ? (globalThis as typeof globalThis & { crypto?: Crypto }).crypto : undefined;
  if (globalCrypto?.getRandomValues) {
    randomSource = globalCrypto;
    return randomSource;
  }
  throw new Error("Secure random generator (crypto.getRandomValues) is not available in this environment.");
}

function isLessThanEd25519OrderBE(bytes: Uint8Array): boolean {
  for (let i = 0; i < bytes.length; i++) {
    const ai = bytes[i];
    const bi = ED25519_ORDER_BE[i];
    if (ai !== bi) return ai < bi;
  }
  return false;
}

function isLessThanEd25519OrderLE(bytes: Uint8Array): boolean {
  for (let i = bytes.length - 1; i >= 0; i--) {
    const ai = bytes[i];
    const bi = ED25519_ORDER_LE[i];
    if (ai !== bi) return ai < bi;
  }
  return false;
}

function randomFixed32Bytes(curve: Curve): number[] {
  while (true) {
    const bytes = new Uint8Array(32);
    getRandomSource().getRandomValues(bytes);
    if (curve === "ed25519" && !isLessThanEd25519OrderLE(bytes)) continue;
    return Array.from(bytes);
  }
}

function generateUniquePoints(count: number, curve: Curve): number[][] {
  const points: number[][] = [];
  const seen = new Set<string>();
  while (points.length < count) {
    const candidate = randomFixed32Bytes(curve);
    const key = candidate.join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    points.push(candidate);
  }
  return points;
}

export function isScalarWithinCurveRange(curve: Curve, scalar: number[]): boolean {
  if (curve === "ed25519") return isLessThanEd25519OrderBE(Uint8Array.from(scalar));
  return true;
}

export function splitByCurve(curve: Curve, secret: number[], n: number, t: number) {
  if (!isScalarWithinCurveRange(curve, secret)) {
    throw new Error("Secret must be less than the ed25519 curve order.");
  }
  if (curve === "secp256k1" || curve === "secp256r1") {
    const ks_node_hashes = generateUniquePoints(n, curve);
    if ((sss as any).split_ec) {
      const curveId = curve === "secp256k1" ? "secp256k1" : "secp256r1";
      try {
        // New API (>= 0.1.7): accepts curve string
        return (sss as any).split_ec(secret, ks_node_hashes, t, curveId);
      } catch (_) {
        try {
          // Some builds may expect full curve name
          return (sss as any).split_ec(secret, ks_node_hashes, t, curve);
        } catch (_) {
          // Backward compat (<= 0.1.6)
          return (sss as any).split_ec(secret, ks_node_hashes, t);
        }
      }
    }
  }
  if (curve === "ed25519") {
    // Use the same 32-byte generator as secp curves to avoid confusion.
    // These are opaque identifiers; WASM handles any field encoding internally.
    const point_xs = generateUniquePoints(n, curve);
    if ((sss as any).split_ed25519) return (sss as any).split_ed25519(secret, point_xs, t);
  }
  throw new Error("No compatible split function found in sssui_wasm for the selected curve.");
}

export function combineShares(curve: Curve, points: any[], t: number) {
  // Prefer dedicated ed25519 combine when available (>= 0.1.7)
  if (curve === "ed25519" && (sss as any).combine_ed25519) {
    return (sss as any).combine_ed25519(points, t);
  }
  if ((sss as any).combine_ec) {
    const curveId = curve === "secp256k1" ? "secp256k1" : "secp256r1";
    try {
      // New API (>= 0.1.7): accepts curve string
      return (sss as any).combine_ec(points, t, curveId);
    } catch (_) {
      try {
        return (sss as any).combine_ec(points, t, curve);
      } catch (_) {
        // Backward compat
        return (sss as any).combine_ec(points, t);
      }
    }
  }
  throw new Error("No compatible combine function found in sssui_wasm.");
}
