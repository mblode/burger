const { src, dest, watch, series, parallel } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const postcssPresetEnv = require('postcss-preset-env');

// Load all Gulp plugins into the variable g
const g = gulpLoadPlugins();

// Styles Task
function styles() {
  return src('src/sass/**/*.scss')
    .pipe(g.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(g.sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    // Use PostCSS with preset-env
    .pipe(postcss([
      postcssPresetEnv(/* plugin options */)
    ]))
    .pipe(g.rename({ suffix: '.min' }))
    .pipe(g.sourcemaps.write('.'))
    .pipe(dest('dist/css/'))
    .pipe(browserSync.stream());
}

// Scripts Task
function scripts() {
  return src('src/scripts/**/*.js')
    .pipe(g.plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(g.sourcemaps.init())
    .pipe(g.concat('bundle.js'))
    .pipe(dest('dist/scripts/'))
    .pipe(g.rename({ suffix: '.min' }))
    .pipe(g.uglify())
    .pipe(g.sourcemaps.write('.'))
    .pipe(dest('dist/scripts/'))
    .pipe(browserSync.stream());
}

// HTML Task
function html() {
  return src('src/*.html')
    .pipe(dest('dist/'))
    .pipe(browserSync.stream());
}

// Browser Sync Task
function serve() {
  browserSync.init({
    server: {
      baseDir: './dist/'
    }
  });
}

// Watch Task
function watchFiles() {
  watch('src/sass/**/*.scss', styles);
  watch('src/scripts/**/*.js', scripts);
  watch('src/*.html', html);
  // Reloads the browser whenever HTML or JS files change
  watch('src/**/*.html').on('change', browserSync.reload);
  watch('src/scripts/**/*.js').on('change', browserSync.reload);
}

// Default Gulp Task
exports.default = series(
  parallel(html, styles, scripts),
  parallel(serve, watchFiles)
);
