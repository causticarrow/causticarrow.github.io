# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **purely static, client-side website** — an esports betting tracker
deployed via GitHub Pages (see `CNAME` → `causticarrow.com`). There is no build step,
no test suite, and no lint configuration.

Key files:
- `index.html` — page markup and structure.
- `app.js` — all client-side logic (parses picks, computes stats, renders the feed, handles filter tabs and "Copy Record").
- `raw-picks.js` — the bet data (`window.RAW_PICKS`), edited by hand to add/update bets.
- `styles.css` — styling.
- `logo/` — team logo PNGs, referenced by slug (see `logoSlug()` in `app.js`).

### Running the site locally
There is no dev server tooling in the repo. Serve the folder with any static file
server from the repo root, e.g.:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/`. Editing any file just requires a browser refresh —
there is no hot reload or bundler.

### Notes / gotchas
- `node_modules/` (only `sharp`) is committed to git but is **not** used by the site at
  runtime and there is **no `package.json`**, so `npm install` does nothing useful. Do
  not rely on npm scripts.
- There are no automated tests, linters, or build commands. "Verification" means loading
  the page in a browser and confirming the feed renders and the filter tabs / Copy Record
  button work.
- The `document.fonts.load(...)` gate in `index.html` hides the body until fonts load
  (with a 2.5s fallback), so a brief blank flash on first paint is expected.
<!-- d677d182334d -->
