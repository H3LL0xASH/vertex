# Overview

Vertex is a **Computer-Based Test (CBT) exam simulator** with a floating-3D
pastel UI. The core loop:

1. **Library** — create subjects/chapters, link a question dataset (JSON) to a chapter.
2. **Exam player** — timed test with question palette, sections, marking, instant feedback.
3. **Result** — score summary, review wrong/unattempted/marked, restart or reattempt.
4. **Overview + Analytics** — everything derives live from saved attempts.

## Pages (hash routes)

| Route | Page | Job |
| ----- | ---- | --- |
| `#/overview` | Overview | Stats, heatmap, momentum, recents, saved |
| `#/library` | Library | Manage subjects/chapters/datasets, import/export |
| `#/analytics` | Analytics | Trends, subjects, weak topics, time |
| `#/upload` | Upload | Dataset dropzone with auto-detect |
| `#/player/<id>` | Exam | The CBT workspace (focus layout, no sidebar) |
| `#/player/<id>?review=WRONG` | Exam | Filtered review mode |
| `#/result/<id>` | Result | Summary + review entry points |

Hash routing means refresh restores your exact tab/attempt and the browser
Back/Forward buttons work with zero server configuration — important for both
static hosting and the Tauri bundle.

## Key behaviors

- **Answers lock** once selected; Clear Response unlocks.
- **Attempts auto-save** after every action (answers, marks, position, score,
  time, visited flags) — close anytime, resume later.
- **Reattempt mode** (post-submit): re-answer blind with live feedback; the
  submitted score stays frozen; the old wrong pick shows with just an X.
- **Saved questions**: star any question mid-exam; revisit from Overview.
- **Streak + activity**: consecutive active days from attempt timestamps.
- **Dark + light themes** (login is always light). Persisted per user.
