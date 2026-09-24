# Tools used

| Tool | Version | Why |
| ---- | ------- | --- |
| React | 19 | UI + hooks (`useExam`, store context) |
| Vite | 6 | Dev server, HMR, production bundling |
| Tailwind CSS | 4 (Vite plugin) | Inline utility styling; custom theme in CSS |
| Tauri | 2 (`@tauri-apps/cli`) | Windows desktop shell around `dist/` |
| Rust + MSVC | stable / VS Build Tools | Tauri backend compiler + linker (desktop only) |
| Node.js | 20+ | Build tooling |
| playwright-core + system Edge/Chrome | 1.63 + installed browser | Headless verification harness (temporary scripts, not shipped) |
| Git + GitHub | — | Source control, releases for installers |
| Google Fonts | Inter + Plus Jakarta Sans | Body + brand type |

No UI kit, no router, no backend, no database — everything else is
hand-rolled in `src/` (`f3d` 3D system, `neon` hover, CBT engine).
