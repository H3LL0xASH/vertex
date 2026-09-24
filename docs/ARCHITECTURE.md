# Architecture

## Stack

React 19 + Vite 6 + Tailwind CSS v4 (inline utilities), no router library
(hash routing in `App.jsx`), no backend. Tauri v2 wraps the same `dist/`
for the Windows desktop app.

## Data flow

```text
JSON file → validateExam → normalizeExam → createAttempt → useExam hook
   → Player UI → autosave (localStorage) → Overview/Analytics derive
```

- **Format + grading**: `src/engine/examFormat.js` — same contract as the
  `D:\WEB` CBT engine (validate, normalize, lock-once scoring, palette
  statuses, summary math, review index lists, clock format).
- **Attempts**: `src/engine/attempts.js` — one self-contained record per
  attempt (`vertexAttemptsV1`): questions, answers, marked, visited,
  currentIndex, score, timeSpentSec, status, timestamps. Plus stats,
  activity, accuracy, series, topics, pace, streak, rollup helpers.
- **Live attempt**: `src/engine/useExam.js` — timer ticker, filtered
  navigation, section/tag filters (reset review), review modes, submit,
  restart. Persists after every mutation.
- **Backup**: `src/engine/backup.js` — `vertex-library-backup` packs
  (subjects + datasets + attempts) and import auto-detect (backup vs
  subject list vs raw exam dataset).
- **Global state**: `src/store.jsx` — auth, theme (login forced light),
  library (+creation-stamp migration), toasts (auto-dismiss), loader
  overlay, chapter dataset linking, attempt launching.

## Storage keys (all localStorage)

| Key | Contents |
| --- | -------- |
| `vertexLibraryV1` | subjects → chapters → linked dataset JSON |
| `vertexAttemptsV1` | attempt records (answers, marks, visited, score, time) |
| `vertexSavedV1` | starred `{attemptId, qid}` entries |
| `vertexName` / `vertexAuthed` | identity gate |
| `vertexTheme` | `light` / `dark` |
| `vertexNavCollapsed` / `vertexSort` / `vertexPaletteLegend` | UI prefs |

## Design system

`src/index.css` owns the floating-3D language on top of Tailwind:

- `.f3d` cards (layered outer + inset shadows, glass bevel, hover lift),
  `.f3d-pill`, `.f3d-orb`, `.f3d-btn-red/violet/green`, `.f3d-sphere`,
  `.f3d-text` extruded wordmarks, `.no-gloss` bevel opt-out.
- `.neon` hover (outline + glow in the element's `--neon` color) with a
  one-shot conic border-trace (`neonRound`), `.neon-lock`, `.neon-focus`.
- `.pos-fixed` / `.pos-absolute` — these MUST be used for floating surfaces:
  plain Tailwind `fixed`/`absolute` lose to `.f3d`'s `position: relative`
  (unlayered CSS beats layered utilities on ties).
- `[data-theme="dark"]` remaps every token; hardcoded light utilities have
  explicit dark overrides at the bottom of the file.
- Status/chapter classes: `.pal-btn` + `.pal-correct/wrong/current/marked/visited`
  (each with a dark duplicate), `.cht-*` chapter washes, `.st-*` pills.
