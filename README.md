<div align="center">

# [Burger](https://blode.co/burger)

**A fullscreen hamburger navigation menu in one stylesheet and one ES module, no dependencies**

Add a toggle button and a nav list, link the two files, and the menu works.

<p align="center">
  <a href="https://www.npmjs.com/package/the-burger">
    <img src="https://img.shields.io/npm/v/the-burger?style=flat&colorA=000000&colorB=000000" />
  </a>
  <a href="https://github.com/mblode/burger/blob/master/LICENSE.md">
    <img src="https://img.shields.io/github/license/mblode/burger?style=flat&colorA=000000&colorB=000000" />
  </a>
</p>

</div>

## Demo

Open and close the menu, then try it with the keyboard alone.

<p>
<a href="https://blode.co/burger">
<img alt="View demo" src=".github/assets/demo.svg" width="200" />
</a>
</p>

## Install

```bash
npm install the-burger
```

Or load both files from a CDN, no build step:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/the-burger@3/dist/css/burger.min.css" />
<script type="module" src="https://cdn.jsdelivr.net/npm/the-burger@3/dist/scripts/burger.min.js"></script>
```

The script is an ES module, so `type="module"` is required. It wires up every `.b-menu` on load.

## Quickstart

The toggle is a `<button>` carrying `aria-expanded` and `aria-controls`, and the navigation is a
`<nav>` around a `<ul>`. `aria-expanded` is the only state there is: the stylesheet derives the
overlay, the bars, and the list animation from it.

```html
<nav class="b-nav" id="b-nav" aria-label="Main">
  <ul>
    <li><a class="b-link b-link--active" href="#" aria-current="page">Home</a></li>
    <li><a class="b-link" href="#">About</a></li>
    <li><a class="b-link" href="#">Contact</a></li>
  </ul>
</nav>

<div class="b-container">
  <button class="b-menu" type="button" aria-expanded="false" aria-controls="b-nav" aria-label="Open menu">
    <span class="b-bun b-bun--top"></span>
    <span class="b-bun b-bun--mid"></span>
    <span class="b-bun b-bun--bottom"></span>
  </button>

  <a href="#" class="b-brand">Burger</a>
</div>
```

To wire a toggle yourself instead of on import:

```js
import { initBurger } from "the-burger";

const teardown = initBurger(document.querySelector(".b-menu"));
```

## What you get

- **Keyboard operation:** Escape closes and returns focus to the toggle, and a closed menu stays out
  of the tab order.
- **Focus containment:** the rest of the page goes `inert` while the menu is open, so Tab cycles
  inside the navigation.
- **Scroll handling:** the page locks and the panel scrolls, so a long list stays reachable.
- **Viewport-anchored:** it behaves the same at the bottom of a long page as at the top.
- **Forced colors and reduced motion:** both honored, with 44px minimum touch targets.

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

Sizes derive from each other, so overriding `--burger-size` moves the bars, the cross, and the
navigation offset together. Every rule sits in a cascade layer, and layered CSS loses to unlayered
CSS regardless of specificity, so anything in your own stylesheet wins without `!important`.

## Browser support

Chrome and Edge 123+, Firefox 128+, Safari and iOS Safari 17.5+, because Burger uses cascade layers,
`:has()`, and logical properties.

## License

MIT

---

Crafted by [<img src="https://blode.co/avatar-circle.png" width="20" align="top" />](https://blode.co) [Matthew Blode](https://blode.co)
