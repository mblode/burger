---
"the-burger": major
---

Rebuilt on native CSS and made the menu usable by keyboard.

**The toggle is now a `<button>`.** It was a `<div>` with a click listener, so the
menu could not be opened by keyboard at all and was announced as nothing. The
navigation is a `<nav>` around a `<ul>`; the list items previously sat directly
inside a `<div>`, which no parser accepts. Escape closes the menu and returns
focus to the toggle, clicking a link closes it, and the closed menu is
`visibility: hidden` rather than transparent, so its four links are no longer
invisible stops in the tab order.

**One piece of state.** Open/closed is `aria-expanded` on the toggle, and the
stylesheet derives the overlay, scroll lock, bar rotation and list animation from
it with `:has()`. JavaScript no longer mirrors an `.open` class onto three
separate elements.

**Focus is contained while the menu is open.** The overlay is opaque, but every
link behind it stayed in the tab order, so a keyboard user tabbed out of the menu
into content they could not see. The rest of the page is now `inert` while the
menu is open, and only what Burger set is released on close.

**Sass is gone.** Sources are TypeScript and native CSS in `src/`, bundled by
Lightning CSS and esbuild, organised into
`@layer burger.tokens, burger.overlay, burger.menu, burger.nav` so consumers
override Burger without `!important`. Every value is a `--burger-*` custom
property, derived sizes included, and all layout uses logical properties. The
package ships generated `.d.ts`, so `initBurger` is typed for importers.

**Forced-colors modes are supported.** Each partial maps to system colours under
`@media (forced-colors: active)`; previously the white bars, brand and links were
invisible once the accent wash was discarded.

**Breaking changes**

- The markup contract changed: `<button class="b-menu" aria-expanded aria-controls>`
  and `<nav class="b-nav" id><ul>`. The old `div`/`li` markup will not work.
- `dist/scripts/burger.min.js` is an ES module. Load it with
  `<script type="module">`.
- `dist/sass/burger.scss` is no longer published. Theme with custom properties.
- `box-sizing: border-box` is scoped to Burger's own subtree instead of `*`. A
  page that relied on Burger resetting it will need its own reset.
- Bower support and `bower.json` removed.
- Requires Chrome/Edge 123+, Firefox 128+, Safari 17.5+ for `:has()` and layers.

**Fixes**

- **The menu was anchored to the document rather than the viewport.** The wash,
  the toggle and the navigation were all `position: absolute`, so on any page
  taller than the window, scrolling down and opening the menu painted it at the
  top of the document — over nothing the reader was looking at. All three are
  `position: fixed` now. The demo page is exactly one viewport tall, which is why
  this went unnoticed.
- **`transition: all` was defeating the tab-order fix.** `all` includes
  `visibility`, and transitioning it holds the old `visible` for the duration, so
  after any interaction the closed nav's links computed to visible inside a hidden
  parent and became focusable again. Transitions now name their properties.
- **The published package contained the demo page and its analytics key.** `files`
  was broad enough to ship `dist/index.html`, which embeds a live PostHog project
  key, plus two 31 kB demo images — 119 kB unpacked for a 7 kB component. Now 15 kB
  packed, CSS and scripts only. Anyone who installed 2.x has that key in their
  `node_modules`.
- `burger.min.css` was not minified. The build renamed the file and stopped
  there.
- The closed overlay hit-tested at `opacity: 0`, swallowing clicks anywhere on the
  page beneath it.
- The default font asked for `Helvetica-Neue`, which no platform ships, so it
  always fell through. Now a system stack.
- Dropped dead rules that targeted `.bun-top`, `.bun-mid`, `.bun-bottom` and
  `.b-main`, none of which exist in the markup.
