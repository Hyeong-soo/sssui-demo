# sssui-demo

A minimal browser demo for `sssui_wasm` (WASM-backed Shamir Secret Sharing) with a polished landing page and an interactive playground. Supports multi-curve flows (secp256k1, secp256r1, ed25519) via the WASM bindings.

## Features
- Landing page with multi-chain/Sui focus and a quick start snippet
- Secret Sharing Playground (split/restore)
  - Input: HEX or TEXT (padded/truncated to 32 bytes)
  - Choose total shares (N) and threshold (T)
  - Curve selector: secp256k1 / secp256r1 / ed25519
  - Copy shares, select any T to recover, see HEX/TEXT output
  - Generate “Random 32‑byte HEX” secret

## Getting Started
Prereqs: Node 18+, npm

```bash
npm install
npm run serve   # opens http://localhost:9000
```

Build a production bundle:

```bash
npm run build   # outputs to dist/
```

## Deploy
This is a static site (HTML/JS/WASM). Any static host works.
- Output directory: `dist/`
- Ensure `.wasm` is served with `Content-Type: application/wasm`

Examples:
- Vercel: build `npm run build`, output `dist`
- Netlify: publish `dist` (set a header rule for `.wasm` if needed)
- GitHub Pages: push `dist/` to a `gh-pages` branch

## Project Structure
- `src/components/Landing.tsx` – marketing/landing view
- `src/components/DemoApp.tsx` – playground UI (split/combine, curve toggle)
- `src/utils/bytes.ts` – byte/hex/text helpers
- `src/utils/sss.ts` – curve-aware wrappers for WASM (`splitByCurve`, `combineShares`)
- `src/hooks/useWasmInit.ts` – `sssui_wasm.init()` lifecycle
- `src/index.tsx` – React bootstrap

## Tech
- React 18 + TypeScript + Webpack 5
- `sssui_wasm` ^0.1.5 (WASM; multi-curve support)

## Notes
- The demo treats secrets/shares as opaque 32‑byte arrays; WASM handles curve specifics.
- For ed25519 and other curves, endianness/field encoding is handled inside the WASM library.

## License
MIT — see `LICENSE`.
