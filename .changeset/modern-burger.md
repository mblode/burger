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

**Sass is gone.** Sources are native CSS in `src/*.css`, bundled by Lightning CSS,
organised into `@layer burger.tokens, burger.overlay, burger.menu, burger.nav` so
consumers override Burger without `!important`. Every value is a `--burger-*`
custom property, derived sizes included, and all layout uses logical properties.

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

- `burger.min.css` was not minified. The build renamed the file and stopped
  there.
- The closed overlay hit-tested at `opacity: 0`, swallowing clicks anywhere on the
  page beneath it.
- The default font asked for `Helvetica-Neue`, which no platform ships, so it
  always fell through. Now a system stack.
- Dropped dead rules that targeted `.bun-top`, `.bun-mid`, `.bun-bottom` and
  `.b-main`, none of which exist in the markup.
