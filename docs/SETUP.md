# Setup (web development)

## Prereqs

- Node.js 20+ (`node --version`), npm 9+
- A Chromium browser for the optional headless test harness

## Install & run

```bash
npm install
npm run dev        # Vite dev server with HMR
npm run build      # production bundle → dist/
npm run preview    # serve dist/ locally
```

## Project layout

```text
index.html            # Vite entry (mounts #root)
vite.config.js        # React + Tailwind v4 plugins
src/
  main.jsx            # React root
  App.jsx             # auth gate + hash router + tab shell
  store.jsx           # user, theme, library, toasts, loader, exam actions
  index.css           # Tailwind + floating-3D system + neon + themes
  data/seed.js        # empty library seed, tints, uid()
  engine/
    examFormat.js     # dataset validate/normalize/grade/summary
    attempts.js       # attempt records, stats, analytics derivations
    useExam.js        # live attempt hook (timer, nav, review, persistence)
    backup.js         # export packs + import auto-detect
  components/
    Shell.jsx         # sidebar, topbar, mobile nav, fixed 3D backdrop
    ui.jsx            # Card, Orb, Stat, charts, modal, pager, toast, loader
  pages/              # Login, Overview, Library, Analytics, Upload, Player, Result
src-tauri/            # Tauri desktop shell (Windows)
docs/                 # you are here
legacy/               # archived pre-React static pages (reference only)
```

## Troubleshooting

- **Blank page**: hard-refresh (`Ctrl+Shift+R`) to drop a cached bundle; check
  DevTools console. The `TabGuard` fallback names the failing tab.
- **Port taken**: `vite --port <n> --strictPort`.
- **HMR acting stale**: restart `npm run dev`.
