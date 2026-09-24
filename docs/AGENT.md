# AGENT.md — working guide for AI agents on this repo

Read this before touching code. The user values design consistency and
verification over speed. **Ask before committing** unless told otherwise.

## 1. Orientation first

- Read `docs/ARCHITECTURE.md`, then the files you will change. Never edit
  blind — use Read before Edit (the tooling enforces it).
- Check `git status` / `git log --oneline` to know what's uncommitted.
- Current branch may be `master`. Don't rename it, don't force-push.

## 2. UI consistency is law (`src/index.css` + Tailwind inline)

- Every surface floats: `.f3d` card / `.f3d-pill` / `.f3d-orb` /
  `.f3d-btn-red|violet|green`, never flat fills.
- Every clickable gets neon hover in its own color: class `neon` +
  `[--neon:#...]`. Buttons (`.f3d-btn-*`) carry it automatically.
- Real SVG icons from the `Ico` set in `src/components/ui.jsx` — **never**
  text glyphs (`‹ › ••• → ✕ ＋`) for UI affordances.
- Floating popups/menus: portal to `document.body` with **viewport-only**
  coordinates (`position:fixed`), never inside scroll containers.
- **Cascade-layers gotcha**: unlayered custom CSS beats Tailwind's layered
  utilities on specificity ties. That's why `.f3d{position:relative}` kills
  plain `fixed`/`absolute` — always use `.pos-fixed` / `.pos-absolute`
  on floating `.f3d` surfaces.
- Dark theme: every hardcoded light color needs a `[data-theme="dark"]`
  override (see bottom of `index.css`); status classes need dark duplicates.
- Motion language: `page-in` (tabs), `pop-in` (menus/modals), `neonRound`
  border-trace on hover, view transitions for tab switches.
  Respect `prefers-reduced-motion` for new ambient motion.

## 3. Behavior contracts (don't silently change)

- Exam engine mirrors the `D:\WEB` CBT: locked answers, palette statuses
  (correct/wrong/current/marked/visited), review modes, count-up timer,
  `score/(total×mark)` percentage. See `docs/EXAM_JSON.md`.
- Storage keys in `docs/ARCHITECTURE.md` — never rename without migrating.
- Hash routes (`#/library`, `#/player/<id>?review=`) power refresh restore
  and Back/Forward. `App.jsx` owns them; pages stay route-agnostic.
- No dummy data, ever. Empty states over placeholders. Numbers derive
  from attempts/datasets or the UI says so honestly.

## 4. Verify like this (cheap → expensive)

1. `npm run build` — must pass before any claim of done.
2. Targeted `node --check` / node ESM smoke tests for engine math
   (validate, normalize, scoring, summary, streak, backup detect).
3. Headless browser (playwright-core + system Chrome) against
   `vite --port <n>` for UI flows: render per tab/theme, menus open,
   no `pageerror`, no page-level overflow at 360/768/1280/1920.
   Keep harness scripts in the OS temp dir — never in the repo.
4. Kill test servers afterward; remove temp scripts.

## 5. Repo hygiene

- `node_modules/`, `dist/`, `src-tauri/target/` stay ignored.
- `legacy/` is read-only reference — don't build on it.
- Keep files small and single-purpose (`engine/`, `components/`,
  one component per concern). If a page exceeds ~700 lines, split it.
- Commit messages: short imperative subject + what/why body. One logical
  change per commit. **Ask the user before `commit`/`push`/releases.**
