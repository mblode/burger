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
  scripts/burger.ts       TypeScript, ESM, auto-inits on import
  scripts/burger.test.ts  vitest + jsdom, JS contract only (see below)
  index.html       demo page (also the deployed site's source)
  img/             opengraph image
dist/              BUILD OUTPUT, committed — css/, scripts/ (js + .d.ts), img/, index.html
site/              deploy artifact, gitignored, produced by build:site
```

## Commands

```bash
npm run build        # src/ -> dist/ (Lightning CSS + esbuild + tsc declarations)
npm run lint         # oxlint
npm run format       # oxfmt --write .   (scope to changed files)
npm run check:types  # tsc --noEmit
npm run test:unit    # vitest run
npm test             # lint + format + types + unit + build + publint + attw
```

esbuild compiles the TypeScript and `tsc -p tsconfig.build.json` emits only the
`.d.ts` that `exports.types` points at. Two tsconfigs on purpose: the root one is
`noEmit` and covers the tests, the build one excludes them.

## Testing

Two suites, split by what the environment can actually observe.

- `src/scripts/burger.test.ts` — **vitest + jsdom**, the JavaScript contract:
  toggling, Escape, focus return, closing on navigation, `inert`, teardown.
- `tests/burger.browser.spec.ts` — **Playwright + Chromium**, everything that comes
  out of a `:has()` selector, inherited `visibility`, a real scroll container, or a
  media query: viewport anchoring, the scroll container on short viewports, focus
  containment, touch targets, forced colors, reduced motion, and that no layout
  property is transitioned. jsdom implements none of this, so do not try to move
  these into the unit suite; they will pass vacuously.

`npm test` runs the unit suite. `npm run test:browser` runs the browser suite
(needs `npx playwright install chromium` once); CI runs both.

When emulating a media feature in the browser suite, use `page.emulateMedia()`
inside the test rather than `test.use({ reducedMotion })` — the latter lost to the
project-level `use` in `playwright.config.ts` and the assertion passed against
un-emulated defaults.

## Architecture conventions (enforced, not optional)

- **One piece of state**: `aria-expanded` on `.b-menu`. The stylesheet derives the
  overlay, scroll lock, bar rotation, and list animation from it with `:has()`.
  Never add a second `.open` class for CSS to key off; there is nothing to sync.
- **Cascade layers**: everything lives in
  `@layer burger.tokens, burger.overlay, burger.menu, burger.nav`. Layered rules
  lose to any unlayered author CSS, so consumers override Burger for free.
- **Tokens only**: never hardcode a colour or size, reference a `--burger-*`
  custom property from `_tokens.css`. Values computed from other tokens are
  themselves tokens (`--burger-nav-offset-block`), so overriding `--burger-size`
  recomputes every dependent value rather than half of them.
- **Logical properties**: `inset-block-start`, `padding-inline`, `inline-size`,
  `text-align: start` — never physical `left`/`right`/`top`/`bottom`/`width`.
- **Viewport-anchored, not document-anchored**: the wash, the toggle and the nav
  are all `position: fixed`. They were `absolute`, which pins them to the top of
  the document: on a page taller than the window, scrolling down and opening the
  menu painted it off-screen. The demo is one viewport tall, so nothing showed it.
- **The panel is the scroll container.** `.b-nav` is `inset: 0` with
  `overflow-y: auto` and `overscroll-behavior: contain`; the page behind stays
  `overflow: hidden`. Any list taller than the window was otherwise unreachable —
  the wheel did nothing and focus could not scroll a clipped link into view. Keep
  the list's top and bottom padding on the `<ul>`, not on `li:first-child`, so it
  is scrollable content rather than an offset the container knows nothing about.
  The toggle stays `fixed` and outside the scroller: a close button that can be
  scrolled away is how a fullscreen menu becomes a trap.
- **44px touch targets**: `--burger-target-size` is the floor for anything tapped.
  Links are `inline-flex` with `min-block-size` rather than bare inline boxes,
  which were 28px tall.
- **Gate hover behind `(hover: hover) and (pointer: fine)`**, or a tap leaves the
  link stuck in its hover state until you tap elsewhere.
- **Two motion durations**: `--burger-duration` (0.4s) for opening, which is
  occasional and large; `--burger-hover-duration` (0.15s) for hover, which happens
  constantly and has to feel immediate.
- **The z-index lives on `.b-container`, not its children.** `position: fixed`
  makes the container a stacking context, so a z-index on `.b-menu` or `.b-brand`
  is confined to it and cannot lift them above the wash. Stack is nav 11,
  container 12, wash 0.
- **Scoped reset**: `box-sizing` is set on `:where(.b-container *, .b-nav *)`, not
  on `*`. A component stylesheet does not restyle its host page.
- **Hidden means unfocusable**: closed nav is `visibility: hidden`, not just
  `opacity: 0`. Transparent links still take focus and still hit-test.
- **Never `transition: all`, and never a layout property.** Name the properties,
  and keep them to `translate`/`rotate`/`opacity`/colour. `all` includes
  `visibility`, and transitioning that holds the old `visible` for the duration —
  which made closed nav links compute to visible inside a hidden parent and become
  focusable again after any interaction. The hover indent is why `li::before` owns
  the indicator bar: a border on the link cannot stay put while the link's own
  padding animates, and padding animation is layout work every frame.
- **`inert` is JavaScript's job**: the open menu covers the page, and CSS cannot
  take what is behind it out of the tab order. `burger.ts` walks up from the
  container and the nav and inerts each ancestor's other children, restoring only
  what it set. Body-children-only would miss a toggle nested in a `<header>`.
- **Forced colors**: every partial ends with a `@media (forced-colors: active)`
  block mapping to system colours (`Canvas`, `CanvasText`, `LinkText`,
  `Highlight`). Never `forced-color-adjust: none` — that overrides a deliberate
  preference.
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
