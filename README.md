# vertex — Exam Simulator

Practice any question bank on a real CBT interface, with local-first analytics.
One codebase ships as a **website** and a **Windows desktop app (Tauri)**. No
servers, no accounts — your data never leaves your machine.

## Quick start (web)

```bash
npm install
npm run dev      # local preview, default http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the production bundle locally
```

## Desktop app (Windows)

Requires the Rust toolchain + MSVC build tools (one-time setup).
Full steps: [`docs/DESKTOP.md`](docs/DESKTOP.md).

```bash
npm run tauri dev    # run inside a desktop window
npm run tauri build  # produces .msi / .exe in src-tauri/target/release/bundle/
```

## What it does

| Area       | Details                                                        |
| ---------- | -------------------------------------------------------------- |
| Login      | Name gate, always light theme                                  |
| Overview   | Live stats, activity heatmap, weekly momentum, recent + saved  |
| Library    | Subjects/chapters, dataset linking, import/export with picker  |
| Exam       | Timed CBT: palette, sections, mark-for-review, instant grading |
| Result     | Score summary, section breakdown, wrong/unattempted/marked review |
| Analytics  | Trends, mastery, weak topics, pace (insights: coming soon)     |
| Upload     | Drag-and-drop dataset intake with format auto-detect           |

Upload any dataset in the documented [exam JSON format](docs/EXAM_JSON.md) —
it becomes a working test immediately. Back up everything (subjects,
datasets, attempts) to one file and restore it anywhere:
[backup format](docs/BACKUP.md).

## Docs

- [`docs/RELEASE_NOTES.md`](docs/RELEASE_NOTES.md) - v1.0.0 release notes
- [`docs/OVERVIEW.md`](docs/OVERVIEW.md) — product tour
- [`docs/SETUP.md`](docs/SETUP.md) — development setup
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — code map, engine, storage
- [`docs/EXAM_JSON.md`](docs/EXAM_JSON.md) — question dataset format
- [`docs/BACKUP.md`](docs/BACKUP.md) — export/import format
- [`docs/DESKTOP.md`](docs/DESKTOP.md) — Tauri desktop builds
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — website hosting + releases
- [`docs/TOOLS.md`](docs/TOOLS.md) — stack and tooling
- [`docs/AGENT.md`](docs/AGENT.md) — working guide for AI agents

## Privacy

100% local-first. Subjects, datasets, attempts, and settings live in your
browser's `localStorage` (desktop: the WebView profile). Nothing is uploaded
anywhere, ever.
