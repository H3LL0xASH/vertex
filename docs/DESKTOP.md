# Desktop app (Tauri, Windows-only)

The desktop app is a thin Tauri v2 shell around the exact same `dist/`
bundle — no code fork, no behavior differences. Storage stays in the
WebView profile (`localStorage`), so the app works fully offline.

## One-time prerequisites (Windows)

1. **Rust toolchain** via rustup: https://rustup.rs
   (`rustc --version` to verify; ~1–2 GB with components)
2. **MSVC C++ build tools** (for `link.exe` + Windows SDK): Visual Studio
   Build Tools with the "Desktop development with C++" workload, **or** a
   full Visual Studio installation with the same workload.
3. **WebView2**: preinstalled on Windows 10/11 (bundled automatically for
   users who lack it).

## Project wiring

```text
src-tauri/
  Cargo.toml          # tauri app crate (tauri 2, serde)
  tauri.conf.json     # app id, product name, frontendDist ../dist,
                      # devUrl http://localhost:1420, windows bundlers
  src/main.rs         # stock Tauri entry (opener plugin for file dialogs)
  capabilities/       # least-privilege capability sets
  icons/              # generated via `npm run tauri icon`
package.json          # "tauri": "tauri dev|build"
vite.config.js        # base './' so assets resolve inside the bundle
```

Frontend notes: hash routing (no server rewrites needed), no `fetch()` to
remote origins, file intake via `<input type=file>` — all Tauri-safe.

## Build & release

```bash
npm run tauri dev      # desktop window with HMR
npm run tauri build    # → src-tauri/target/release/bundle/
```

Ship from `bundle/`: `nsis/vertex_*-setup.exe` (installer) and
`msi/vertex_*.msi`. Publish both under a GitHub Release (see
[DEPLOYMENT.md](DEPLOYMENT.md)). Unsigned builds trigger a SmartScreen
prompt on first run — expected without a code-signing certificate.

## Troubleshooting

- `link.exe not found` → install/fix the MSVC workload, then restart the shell.
- WebView2 missing on user machines → NSIS bootstrapper downloads it.
- `failed to bundle project: timeout: global` on the NSIS/WiX step →
  the toolchain CDN (`objects.githubusercontent.com`) is unreachable from
  your network. The compiled `src-tauri/target/release/vertex.exe` already
  works standalone — retry `npm run tauri build` on a better connection for
  the `.msi` / setup `.exe` wrappers.
- Blank window → open devtools (`tauri dev` shows console) — same `TabGuard`
  fallback as the web build applies.
