# AGENTS.md — the-burger

Burger is a **hamburger menu with fullscreen navigation**: a stylesheet, ~40 lines
of JavaScript, and a demo page. Shipped as the npm package `the-burger` and a CDN
stylesheet. No framework, no runtime dependencies.

## Repo layout

```
src/
  burger.css       entry: declares @layer order + @imports each partial into a layer
  _tokens.css      burger.tokens  — the --burger-* theming API, including derived calc()
  _overlay.css     burger.overlay — the accent wash, scroll lock, box-sizing scope
  _menu.css        burger.menu    — the toggle button, its three bars, the brand
  _nav.css         burger.nav     — the nav list, links, slide keyframes
  scripts/burger.js  ESM, auto-inits on import, exports initBurger/initAllBurgers
  index.html       demo page (also the deployed site's source)
  img/             opengraph image
dist/              BUILD OUTPUT, committed — css/, scripts/, img/, index.html
site/              deploy artifact, gitignored, produced by build:site
```

## Commands

```bash
npm run build      # src/ -> dist/ (Lightning CSS + esbuild + cp)
npm run lint       # oxlint
npm run format     # oxfmt --write .   (scope to changed files)
npm test           # lint + format:check + build + publint
```

## Architecture conventions (enforced, not optional)

- **One piece of state**: `aria-expanded` on `.b-menu`. The stylesheet derives the
  overlay, scroll lock, bar rotation, and list animation from it with `:has()`.
  Never add a second `.open` class for CSS to key off; there is nothing to sync.
- **Cascade layers**: everything lives in
  `@layer burger.tokens, burger.overlay, burger.menu, burger.nav`. Layered rules
  lose to any unlayered author CSS, so consumers override Burger for free.
- **Tokens only**: never hardcode a colour or size, reference a `--burger-*`
  custom property from `_tokens.css`. Values computed from other tokens are
  themselves tokens (`--burger-bun-offset-block`), so overriding `--burger-size`
  recomputes every dependent value rather than half of them.
- **Logical properties**: `inset-block-start`, `padding-inline`, `inline-size`,
  `text-align: start` — never physical `left`/`right`/`top`/`bottom`/`width`.
- **Scoped reset**: `box-sizing` is set on `:where(.b-container *, .b-nav *)`, not
  on `*`. A component stylesheet does not restyle its host page.
- **Hidden means unfocusable**: closed nav is `visibility: hidden`, not just
  `opacity: 0`. Transparent links still take focus and still hit-test.
- **Focus**: always `:focus-visible` with `outline-offset: 2px`, never
  `outline: none`. Pick the ring by what the element sits on:
  `--burger-ring-on-surface` over the host page, `--burger-ring-on-accent` over
  the open overlay. The toggle needs both, because it changes background; a ring
  that matches its backdrop is drawn and invisible, which nothing will flag.
- **Motion**: every `transition`/`animation` sits inside
  `@media (prefers-reduced-motion: no-preference)`.
- **No `!important`**, no vendor prefixes — Lightning CSS adds them from
  browserslist.

## Release flow

Changesets-driven, OIDC publish (no npm token in CI). `baseBranch` is `master`.

1. `npm run changeset` and commit the generated `.changeset/*.md`.
2. Merge to `master`. The changesets action opens/updates a **Version Packages** PR.
3. Merge that PR — CI publishes to npm via OIDC and tags the release.

## Gotchas

- **After editing anything in `src/`, run `npm run build`** — `dist/` is committed
  and consumed by CDN and npm users; a stale `dist/` ships broken styles.
- **Keep `dist/` paths stable** (`dist/css/burger.min.css`,
  `dist/scripts/burger.min.js`). CDN URLs and the demo page are pinned to them.
- **A no-op build still dirties `dist/css/burger.min.css.map`.** Lightning CSS
  resolves `@import`s concurrently, so the map's `sources` order shuffles between
  runs while the CSS stays byte-identical. Nothing is wrong; leave the map out of
  the commit if it is the only change. CI's freshness check excludes `*.map` for
  the same reason.
- **The demo page is the deployed site.** `src/index.html` is copied to
  `dist/index.html`, then `build:site` copies `dist/` into `site/burger/` for
  Vercel. Editing `dist/index.html` by hand gets overwritten.
- `burger.min.js` is an ES module, so the demo loads it with
  `<script type="module">`. A plain `<script src>` will not run it.
- Run `format` scoped to your changes — don't let it churn unrelated files.
