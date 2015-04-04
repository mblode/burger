'use strict';

var gulp = require('gulp');
var $g = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var scsslint = require('gulp-scss-lint');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app/'
    }
  });
});

gulp.task('js-hint', function() {
  return gulp.src('app/scripts-src/*.js')
    .pipe($g.jshint())
    .pipe($g.jshint.reporter('jshint-stylish'));
});

gulp.task('js', ['js-hint'], function() {
  return gulp.src('app/scripts-src/*.js')
    .pipe(gulp.dest('app/scripts/'))
    .pipe($g.rename(function(path) {
      path.basename += '.min';
    }))
    .pipe($g.uglify())
    .pipe(gulp.dest('app/scripts/'));
});

gulp.task('scss-lint', function(){
  return gulp.src('app/scss/**/*.scss')
    .pipe(scsslint());
});

gulp.task('sass', ['scss-lint'], function() {
  return gulp.src([
      'app/scss/*.scss',
      'app/styles/**/*.css',
      '!app/styles/**/*.min.css'
    ])
    .pipe($g.sourcemaps.init())
    .pipe($g.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($g.autoprefixer(['last 2 versions, > 5%'], {
      cascade: true
    }))
    .pipe($g.sourcemaps.write())
    .pipe(gulp.dest('app/css/'))
    .pipe($g.if('*.css', $g.cssmin()))
    .pipe($g.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('app/css/'));
});

gulp.task('clean', function () {
    return gulp.src('dist/')
      .pipe($g.clean());
});

gulp.task('css-build', ['clean', 'scss-lint', 'sass'], function() {
  return gulp.src('app/css/*.css')
    .pipe(gulp.dest('dist/css/'));
});

gulp.task('sass-build', ['clean', 'scss-lint', 'sass'], function() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(gulp.dest('dist/scss/'));
});

gulp.task('js-build', ['clean', 'js-hint', 'js'], function() {
  return gulp.src('app/scripts/*.js')
    .pipe(gulp.dest('dist/scripts/'));
});

gulp.task('html-build', ['clean'], function() {
  return gulp.src([
      'app/*.html'
    ])
    .pipe(gulp.dest('dist/'));
});

gulp.task('js-watch', ['js-hint', 'js'], reload);

gulp.task('serve', ['scss-lint', 'sass', 'js-hint', 'js', 'js-watch'], function() {

  browserSync({
    server: './app'
  });

  gulp.watch('app/scripts-src/**/*.js', ['js-watch']);
  gulp.watch('app/scss/**/*.scss', ['sass', reload]);
  gulp.watch('app/**/*.html').on('change', reload);
});

gulp.task('default', ['serve']);

gulp.task('build', ['clean', 'sass', 'css-build', 'sass-build', 'js-hint', 'js', 'js-build', 'html-build']);
