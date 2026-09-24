# Deployment

## Website (static hosting, no backend)

The web build is a pure static SPA with hash routing, so any static host
works with zero rewrite rules:

```bash
npm run build   # → dist/
```

- **Vercel / Netlify / Cloudflare Pages**: point at the repo, build command
  `npm run build`, output dir `dist/`. Free tiers suffice, HTTPS included.
- **GitHub Pages**: same `dist/` output via any static deploy action.
- Custom domain: optional, configured at the host.

## Desktop releases (GitHub)

1. Build on Windows: `npm run tauri build`.
2. Collect from `src-tauri/target/release/bundle/`:
   - `nsis/vertex_<version>-setup.exe`
   - `msi/vertex_<version>.msi`
3. Create a GitHub Release (e.g. tag `v1.0.0`) and attach both files as
   release assets with install notes (SmartScreen prompt is normal for
   unsigned builds).

Keep `dist/` and `src-tauri/target/` out of git (see `.gitignore`) — releases
carry the binaries, the repo carries the source.
