# Burger

Burger is a minimal hamburger menu with fullscreen navigation. One stylesheet,
about forty lines of JavaScript, no runtime dependencies.

## [Demo](https://blode.co/burger)

## Screenshots

![Burger: Closed](http://i.imgur.com/eElVkQI.png)

![Burger: Opened](http://i.imgur.com/tI0ZeNw.png)

## Quick start

```bash
npm install the-burger
```

Or from a CDN:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/the-burger@3/dist/css/burger.min.css"
/>
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/the-burger@3/dist/scripts/burger.min.js"
></script>
```

The script is an ES module, so it needs `type="module"`. It wires up every
`.b-menu` on the page when it loads. To control that yourself:

```js
import { initBurger } from "the-burger";

const teardown = initBurger(document.querySelector(".b-menu"));
```

## Markup

The toggle is a `<button>` with `aria-expanded` and `aria-controls`, and the
navigation is a `<nav>` around a `<ul>`. Both matter: `aria-expanded` is the only
state the component has, and the stylesheet derives everything else from it.

```html
<nav class="b-nav" id="b-nav" aria-label="Main">
  <ul>
    <li><a class="b-link b-link--active" href="#" aria-current="page">Home</a></li>
    <li><a class="b-link" href="#">About</a></li>
    <li><a class="b-link" href="#">Portfolio</a></li>
    <li><a class="b-link" href="#">Contact</a></li>
  </ul>
</nav>

<div class="b-container">
  <button
    class="b-menu"
    type="button"
    aria-expanded="false"
    aria-controls="b-nav"
    aria-label="Open menu"
  >
    <span class="b-bun b-bun--top"></span>
    <span class="b-bun b-bun--mid"></span>
    <span class="b-bun b-bun--bottom"></span>
  </button>

  <a href="#" class="b-brand">Burger</a>
</div>
```

You get keyboard operation, Escape to close with focus returned to the toggle,
closing on navigation, a scroll lock while open, and a closed menu that stays out
of the tab order. While the menu is open the rest of the page is `inert`, so Tab
cycles inside the navigation instead of wandering into content behind the overlay.
Forced-colors modes are handled, and the whole thing is viewport-anchored, so it
works the same at the bottom of a long page as at the top.

## Theming

Every value is a `--burger-*` custom property. Redeclare the ones you want:

```css
:root {
  --burger-accent: #111;
  --burger-on-accent: #fff;
  --burger-size: 48px;
  --burger-font-family: "Inter", sans-serif;
  --burger-duration: 0.25s;
}
```

Sizes derive from each other, so overriding `--burger-size` moves the bars, the
cross, and the navigation offset together.

Burger's rules live in `@layer burger.tokens, burger.overlay, burger.menu,
burger.nav`. Layered CSS loses to unlayered CSS regardless of specificity, so any
rule you write in your own stylesheet wins without `!important`.

Motion sits inside `@media (prefers-reduced-motion: no-preference)`; readers who
ask for less motion get the menu with no transitions or slide-in.

## Development

```bash
npm install
npm run build      # src/ -> dist/ (Lightning CSS + esbuild + tsc declarations)
npm test           # lint, format, types, unit tests, build, publint, attw
npm run build:site # writes site/burger/ for hosting at blode.co/burger
```

The source is TypeScript and ships generated declarations, so `initBurger` is
typed for importers.

`dist/` is committed because CDN and npm consumers load it directly. Rebuild
after touching anything in `src/`; CI fails if the two disagree. See
[AGENTS.md](AGENTS.md) for the architecture conventions.

## Browser support

Burger uses cascade layers, `:has()`, and logical properties. Chrome and Edge
123+, Firefox 128+, Safari and iOS Safari 17.5+.

## Contributing

Pull requests are the way to go. Add a changeset with `npm run changeset`.

## Creators

**Matthew Blode**

- <https://github.com/mblode>
- <https://blode.co>

## License

MIT © [Matthew Blode](https://blode.co)
