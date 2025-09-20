// Byte/hex/text helpers used across the app

export function hexToUint8Array(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase().replace(/^0x/, "");
  if (clean.length % 2 !== 0) throw new Error("HEX 길이가 짝수가 아닙니다.");
  const arr = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    const byte = parseInt(clean.slice(i, i + 2), 16);
    if (Number.isNaN(byte)) throw new Error("HEX 형식이 올바르지 않습니다.");
    arr[i / 2] = byte;
  }
  return arr;
}

export function toHex(arr: ArrayLike<number>): string {
  return Array.from(arr).map(v => v.toString(16).padStart(2, "0")).join("");
}

export function strToFixed32Bytes(str: string): number[] {
  const enc = new TextEncoder();
  const bytes = Array.from(enc.encode(str));
  return bytes.length > 32 ? bytes.slice(0, 32) : bytes.concat(Array(32 - bytes.length).fill(0));
}

export function toFixed32FromHex(hex: string): number[] {
  const bytes = Array.from(hexToUint8Array(hex));
  if (bytes.length === 32) return bytes;
  if (bytes.length > 32) return bytes.slice(0, 32);
  return bytes.concat(Array(32 - bytes.length).fill(0));
}

export function stringify(value: unknown): string {
  if (value instanceof Uint8Array) return toHex(value);
  if (Array.isArray(value)) return `[${value.map(v => stringify(v)).join(", ")}]`;
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value).map(([k, v]) => `${k}: ${stringify(v)}`);
    return `{ ${entries.join(", ")} }`;
  }
  return String(value);
}

export function bytesToText(arr: ArrayLike<number>): string {
  // Trim trailing 0x00 used for padding and decode UTF-8
  const u8 = Uint8Array.from(arr as number[]);
  let end = u8.length;
  while (end > 0 && u8[end - 1] === 0) end--;
  try {
    return new TextDecoder().decode(u8.subarray(0, end));
  } catch {
    return toHex(u8);
  }
}
