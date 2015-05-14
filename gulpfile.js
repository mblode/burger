'use strict';

var gulp = require('gulp');
var g = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
       baseDir: './dist/'
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('scss-lint', function() {
  gulp.src('/scss/**/*.scss')
    .pipe(g.scssLint());
});

gulp.task('styles', ['scss-lint'], function(){
  gulp.src(['src/sass/**/*.scss'])
    .pipe(g.plumber({
      errorHandler: function (error) {
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
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('js-hint', function() {
  return gulp.src(['src/styles/**/*.scss'])
    .pipe(g.jshint())
    .pipe(g.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['js-hint'], function(){
  return gulp.src('src/scripts/**/*.js')
    .pipe(g.plumber({
      errorHandler: function (error) {
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
    .pipe(browserSync.reload({stream:true}));
});

gulp.task('html', function() {
  return gulp.src(['src/*.html'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['browser-sync'], function(){
  gulp.watch('src/sass/**/*.scss', ['styles']);
  gulp.watch('src/scripts/**/*.js', ['scripts']);
  gulp.watch('src/**/*.html', ['html', 'bs-reload']);
});
