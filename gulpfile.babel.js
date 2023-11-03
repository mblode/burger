'use strict';

import gulp from 'gulp';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const g = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('browser-sync', () => {
  browserSync({
    server: {
       baseDir: './dist/'
    }
  });
});


gulp.task('scss-lint', () => {
  gulp.src('/scss/**/*.scss')
    .pipe(g.scssLint());
});

gulp.task('styles', ['scss-lint'], () => {
  gulp.src(['src/sass/**/*.scss'])
    .pipe(g.plumber({
      errorHandler: (error) => {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(gulp.dest('dist/sass/'))
    .pipe(g.sourcemaps.init())
      .pipe(g.sass({
        precision: 10,
        onError: console.error.bind(console, 'Sass error:')
      }))
      .pipe(g.autoprefixer('last 2 versions'))
      .pipe(g.minifyCss())
      .pipe(g.rename({suffix: '.min'}))
    .pipe(g.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css/'))
    .pipe(reload({stream:true}));
});

gulp.task('js-hint', () => {
  return gulp.src(['src/styles/**/*.scss'])
    .pipe(g.jshint())
    .pipe(g.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['js-hint'], () => {
  return gulp.src('src/scripts/**/*.js')
    .pipe(g.plumber({
      errorHandler: (error) => {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(g.sourcemaps.init())
      .pipe(g.concat('burger.js'))
      .pipe(gulp.dest('dist/scripts/'))
      .pipe(g.rename({suffix: '.min'}))
      .pipe(g.uglify())
    .pipe(g.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/scripts/'))
    .pipe(reload({stream:true}));
});

gulp.task('html', () => {
  return gulp.src(['src/*.html'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['browser-sync'], () => {
  gulp.watch('src/sass/**/*.scss', ['styles']);
  gulp.watch('src/scripts/**/*.js', ['scripts']);
  gulp.watch('src/**/*.html', ['html', reload]);
});
