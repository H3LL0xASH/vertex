# VERTEX 3D DESIGN LANGUAGE — remember for ALL upcoming pages

Source of truth: `assets/vertex-3d.css` (tokens + 3D primitives).
Login (`index.html`) is the visual benchmark. Every new page MUST reuse it.

## 1. Rule: everything is 3D, nothing is flat
- No flat fills. Every surface gets: outer dual shadow (dark + white) + inset top highlight + inset bottom shade.
- Glossy objects (spheres, avatar core, red button, folds): radial highlight centered at ~32% 28% + floor-shadow ellipse beneath.
- Display text (`vertex` hero): stacked extrude via `.v3-text` (white → grey-blue steps + soft ambient blur). Never a single drop-shadow.

## 2. Tokens (from vertex-3d.css)
- `--v-bg:#f5f7fc` `--v-ink:#121828` `--v-muted:#8a90a5` `--v-line:#e6eaf3`
- Rose: `#f6c1c4 → #e99aa1 → #cf707a` (avatar, spheres, folds)
- Blue dome: `#d7e5f9 → #9db6e0` (top-leftcockpit)
- Red CTA: `#ff5d4e → #ef232f → #cf1424` + `--v3-glow-red`
- Shadows: `--v3-out-sm/md/lg`, `--v3-in`, `--v3-in-soft`
- Fonts: brand `Plus Jakarta Sans 800`, body `Inter`.

## 3. Primitives — reuse these classes, don't reinvent
- `.v3-text` — extruded hero wordmark
- `.v3-sphere` + `.v3-floor-shadow` — glossy balls with grounding
- `.v3-pill` — neumorphic input / search / select
- `.v3-btn-red` — glossy red CTA (has ::before glass bevel + ::shine sweep optional)
- `.v3-avatar-ring` > `.v3-avatar-core` — profile avatar
- `.v3-card` — panels/cards
- Dark mode: only flip `[data-theme="dark"]` remap in the css (keeps 3D, relights shadows). Page-specific css must use `var(--v-*)` so dark works free.

## 4. Login benchmark details (copy the feel)
- Left scene: blue dome top-left, 3 fabric wave layers (back sheet / mid fold / front glossy fold with white gloss streaks), 2 spheres with floor shadows + text floor blur under wordmark, inflated wavy seam (pink glow edge + white body + white specular line).
- Right: pure light bg with radial white glow, black wordmark with subtle 3-step extrude, `WELCOME BACK` 0.64em tracking, 134px avatar, 64px pill (person icon + chevron), 258×60 red CTA with shine sweep every ~3.4s, parallax on mousemove (brand ±14px, spheres ∓22px).
- Motion: page fade-in, float 6s/7.6s on spheres, button lift on hover / press-down on active, shake on empty submit.

## 5. Dashboard mapping (already applied)
- Sidebar art + stat icon orbs + streak pill + resume button reuse the same rose/blue/red gradients and dual shadows.
- New pages (Library, Analytics, Upload, Test player, Review): same sidebar/topbar/hero skeleton, `.v3-card` panels, `.v3-pill` searches, `.v3-btn-red` primary actions, heatmap/line-chart styling as in dashboard.

## 6. Checklist before shipping any page
1. `<link rel="stylesheet" href="assets/vertex-3d.css">` included?
2. Only `var(--v-*)` colors (no hardcoded greys that break dark mode)?
3. Every button/card/input has outer + inset shadow?
4. Spheres/avatar have highlight + floor shadow?
5. Hero text uses `.v3-text`?
6. Hover/active/focus 3D states present (lift / press / ring)?
