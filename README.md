# Burger
Burger is a minimal hamburger menu with fullscreen navigation. It is created by mblode.

This project officially requires zero external bower dependencies. Woo-hoo!

## Burger in action
![Burger Gif](http://i.imgur.com/spSuHHZ.gif)

## [Demo on Codepen](http://codepen.io/mblode/pen/qEGWwB)

## Screenshots
![Burger: Closed](http://i.imgur.com/eElVkQI.png)

![Burger: Opened](http://i.imgur.com/tI0ZeNw.png)

## Quick Start
Several quick start options are available:

- Install with [Bower](http://bower.io): `bower install burger` (recommended).
- [Download the latest release](https://github.com/mblode/burger/archive/master.zip).
- Clone the repo: `git clone https://github.com/mblode/burger.git`.

if you have cloned the repo or downloaded from .zip, there are a few steps you must take within the terminal.

1. Change directory: `cd burger`.
2. Install node modules: `npm install`.
3. Install scss-lint Ruby gem: `gem install scss-lint`.
4. To run gulp server: `gulp`.
5. To run build process: `gulp build`.

## Running Github Pages
The gh-pages branch is built using Jekyll and must therefore be install with `gem install jekyll`.

1. Checkout in to gh-pages: `git checkout gh-pages`.
2. Install burger dependency: `bower install`.
3. Run jekyll: `jekyll serve`.
4. Open in browser: `localhost:4000/burger/`.


## What's Included
These are the files that are generated from `bower install burger`

```
.
├── README.md
├── bower.json
└── dist
    ├── css
    │   ├── burger..min.css
    │   └── burger.min.css.map
    ├── index.html
    ├── scripts
    │   ├── burger.js
    │   ├── burger.min.js.map
    │   └── burger.min.js
    └── sass
        └── burger.scss
```

## Documentation
### HTML Markup
```
  <!-- Navigation -->
  <div class="b-nav">
    <li><a class="b-link b-link--active" href="#">Home</a></li>
    <li><a class="b-link" href="#">About</a></li>
    <li><a class="b-link" href="#">Portfolio</a></li>
    <li><a class="b-link" href="#">Contact</a></li>
  </div>

  <!-- Burger-Icon -->
  <div class="b-container">
    <div class="b-menu">
      <div class="b-bun b-bun--top"></div>
      <div class="b-bun b-bun--mid"></div>
      <div class="b-bun b-bun--bottom"></div>
    </div>

    <!-- Burger-Brand -->
    <a href="#" class="b-brand">Burger</a>
  </div>
```

## Browser Compatibility
* Safari 6.1+
* IE 10+
* Firefox 29+
* Chrome 26+
* Opera 17+

## Contributing to Burger

Pull requests are the way to go.


## Creators

**Matthew Blode**
- <https://twitter.com/mblode>
- <https://github.com/mblode>
- <http://codepen.io/mblode>

## License
MIT © [Matthew Blode](http://mblode.github.io)
