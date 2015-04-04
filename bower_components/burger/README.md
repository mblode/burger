# Burger
Burger is a minimal hamburger menu with fullscreen navigation. It is created by mblode.

It requires [jQuery](https://jquery.com/) as a dependency.

## Burger in action
![Burger Gif](http://i.imgur.com/spSuHHZ.gif)

## [Demo on Codepen](http://codepen.io/mblode/pen/qEGWwB)

## Quick Start
Several quick start options are available:

- Install with [Bower](http://bower.io): `bower install burger` (recommended).
- [Download the latest release](https://github.com/mblode/burger/archive/master.zip).
- Clone the repo: `git clone https://github.com/mblode/burger.git`.

if you have cloned the repo or downloaded from .zip, there are a few steps you must take within the terminal.

1. Change directory: `cd burger`.
2. Install node modules: `npm install`.
3. Install bower components: `bower install`.
4. To run gulp server: `gulp serve`.
5. To run build process: `gulp build`.


## What's Included
These are the files that are generated from `bower install burger`

```
.
├── README.md
├── bower.json
└── dist
    ├── css
    │   ├── burger.css
    │   └── burger.min.css
    ├── index.html
    ├── scripts
    │   ├── burger.js
    │   └── burger.min.js
    └── scss
        ├── _burger.scss
        ├── _config.scss
        └── burger.scss
```

## Documentation
### HTML Markup
```
  <!-- Navigation -->
  <div class="burger-nav">
    <li><a class="burger-link active" href="#">Home</a></li>
    <li><a class="burger-link" href="#">About</a></li>
    <li><a class="burger-link" href="#">Portfolio</a></li>
    <li><a class="burger-link" href="#">Contact</a></li>
  </div>

  <!-- Burger-Icon -->
  <div class="burger-contain">
    <div class="burger">
      <div class="bun bun-top"></div>
      <div class="bun bun-mid"></div>
      <div class="bun bun-bottom"></div>
    </div>

    <!-- Burger-Brand -->
    <a href="#" class="burger-brand">Burger</a>
  </div>
```

## Contributing to Burger

Pull requests are the way to go.


## Creators

**Matthew Blode**
- <https://twitter.com/mblode>
- <https://github.com/mblode>
- <http://codepen.io/mblode>
