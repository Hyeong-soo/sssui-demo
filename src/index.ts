// src/index.ts

import { init, sss_split, sss_combine } from "sssui_wasm";

// 헥사 문자열 → 바이트 배열
function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex");
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return arr;
}

// 바이트 배열 → 헥사 문자열
function toHex(arr: ArrayLike<number>): string {
  return Array.from(arr).map(v => v.toString(16).padStart(2, "0")).join("");
}

// 문자열을 32바이트 배열로 변환
function strToFixed32Bytes(str: string): number[] {
  const enc = new TextEncoder();
  const bytes = Array.from(enc.encode(str));
  return bytes.length > 32
    ? bytes.slice(0, 32)
    : bytes.concat(Array(32 - bytes.length).fill(0));
}

async function main() {
  await init();

  const secretHex = "a9f1b4e8c2d7a1b3bce478f0d84f211ea1fe5d246b707df733fc7a5f21e2da43";
  const secret = Array.from(hexToUint8Array(secretHex)); // number[] (길이 32)

  console.log("=== 원본 시크릿키 (HEX) ===");
  console.log(secretHex);

  console.log("=== 원본 시크릿키 바이트 배열 ===");
  console.log(secret);

  const ks_node_hashes = [
    strToFixed32Bytes("node1"),
    strToFixed32Bytes("node2"),
    strToFixed32Bytes("node3"),
  ];
  const threshold = 2;

  console.log("\n=== SSS Split ===");
  let shares: any;
  try {
    shares = sss_split(secret, ks_node_hashes, threshold);
    console.log("키 분할 결과:", shares);
  } catch (e) {
    console.error("키 분할 에러:", e);
  }

  console.log("\n=== SSS Combine ===");
  try {
    if (!shares) throw new Error("split 실패");
    const combineInput = shares.slice(0, threshold);
    const combineResult = sss_combine(combineInput, threshold);

    console.log("복원 결과 (byte array):", combineResult);
    const resultHex = toHex(combineResult);
    console.log("복원 결과 (HEX):", resultHex);

    const isEqual = resultHex === secretHex;
    console.log("원본과 동일?(HEX 비교):", isEqual);
  } catch (e) {
    console.error("키 복원 에러:", e);
  }
}

main();
