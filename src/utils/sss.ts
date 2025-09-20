import * as sss from "sssui_wasm";
import { strToFixed32Bytes } from "./bytes";

export type Curve = "secp256k1" | "secp256r1" | "ed25519";

export function splitByCurve(curve: Curve, secret: number[], n: number, t: number) {
  if (curve === "secp256k1" || curve === "secp256r1") {
    const ks_node_hashes: number[][] = Array.from({ length: n }, (_, i) => strToFixed32Bytes(`node${i + 1}`));
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
    const point_xs: number[][] = Array.from({ length: n }, (_, i) => strToFixed32Bytes(`node${i + 1}`));
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
