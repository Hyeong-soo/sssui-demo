import * as sss from "sssui_wasm";
import { strToFixed32Bytes } from "./bytes";

export type Curve = "secp256k1" | "secp256r1" | "ed25519";

export function splitByCurve(curve: Curve, secret: number[], n: number, t: number) {
  if (curve === "secp256k1" || curve === "secp256r1") {
    const ks_node_hashes: number[][] = Array.from({ length: n }, (_, i) => strToFixed32Bytes(`node${i + 1}`));
    if ((sss as any).split_ec) return (sss as any).split_ec(secret, ks_node_hashes, t);
  }
  if (curve === "ed25519") {
    // Use the same 32-byte generator as secp curves to avoid confusion.
    // These are opaque identifiers; WASM handles any field encoding internally.
    const point_xs: number[][] = Array.from({ length: n }, (_, i) => strToFixed32Bytes(`node${i + 1}`));
    if ((sss as any).split_ed25519) return (sss as any).split_ed25519(secret, point_xs, t);
  }
  throw new Error("No compatible split function found in sssui_wasm for the selected curve.");
}

export function combineShares(points: any[], t: number) {
  if ((sss as any).combine_ec) return (sss as any).combine_ec(points, t);
  throw new Error("No compatible combine function found in sssui_wasm.");
}
