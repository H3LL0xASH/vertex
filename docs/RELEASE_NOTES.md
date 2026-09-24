# vertex 1.0.0

**Release date:** September 25, 2026

vertex 1.0.0 is a local-first exam simulator for practicing question banks in
a realistic computer-based testing interface. The release is available as a
web app and a Windows desktop app powered by Tauri.

## Highlights

- Complete CBT exam flow with timed sessions, section navigation, question
  palette, mark-for-review, instant grading, and result breakdowns.
- Local dashboard with activity heatmap, weekly momentum, recent activity, and
  saved questions.
- Subject and chapter library with dataset linking, sorting, pagination, and
  search.
- Drag-and-drop question-bank upload with automatic format detection.
- Import and export for exam datasets, plus full backup and restore for
  subjects, datasets, attempts, and settings.
- Analytics views for trends, mastery, weak topics, and pacing.
- Responsive interface with a collapsible icon rail, keyboard-friendly flows,
  lightweight transitions, and a Windows desktop shell.

## Privacy

All data stays on the device. The web app uses browser `localStorage`, while
the desktop app uses its WebView profile. No accounts, server, or telemetry are
required.

## Run the release

```bash
npm install
npm run dev
```

To build the Windows desktop release:

```bash
npm run tauri build
```

The desktop installer artifacts are generated in
`src-tauri/target/release/bundle/`.

## Verification

- `npm run build`
- `npm run tauri build`
