'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var bower = require('gulp-bower');
var reload = browserSync.reload;
var sourcemaps = require('gulp-sourcemaps');

var messages = {
	jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

gulp.task('bower', function () {
	return bower()
		.pipe(gulp.dest('./bower_components'));
});

gulp.task('icons', function () {
	return gulp.src(['./bower_components/fontawesome/fonts/**.*',
			'./bower_components/bootstrap-material-design/dist/fonts/**.*'
		])
		.pipe(gulp.dest('public/fonts'));
});

gulp.task('images', function () {
	gulp.src('public/_images-build/*.*')
		.pipe(imagemin())
		.pipe(gulp.dest('_site/public/images'))
		.pipe(gulp.dest('public/images/'));
});

gulp.task('js', function () {

	return gulp.src('public/_js-build/*.js')
		.pipe(rename(function (path) {
			path.basename += '.min';
    }))
		.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('public/js/'));
});

gulp.task('js-minify', function () {
});

gulp.task('jekyll-build', function (done) {
	browserSync.notify(messages.jekyllBuild);
	return cp.spawn('jekyll', ['build'], {
			stdio: 'inherit'
		})
		.on('close', done);
});

gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
	reload();
});

gulp.task('browser-sync', ['sass', 'jekyll-build'], function () {
	browserSync({
		server: {
			baseDir: '_site'
		}
	});
});

gulp.task('sass', function () {
	return gulp.src('_sass/main.scss')
		.pipe(sass({
			includePaths: [
				'scss',
				'./bower_components/bootstrap-material-design/sass',

			],
			onError: browserSync.notify,
			style: 'compressed',
			errLogToConsole: true
		}))
		.pipe(prefix(['last 2 versions', 'ie 8', 'ie 9'], {
			cascade: true
		}))
		.pipe(gulp.dest('_site/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
		.pipe(gulp.dest('css'));
});

gulp.task('watch', function () {
	gulp.watch('_sass/**/*.scss', ['sass']);
	gulp.watch('public/_js-build/*.js', ['js', 'jekyll-rebuild']);
	gulp.watch('public/_images-build/*.*', ['images']);
	gulp.watch(['index.html', '_layouts/*.html', '_includes/*.html',
		'_posts/*'
	], [
		'jekyll-rebuild'
	]);
});

gulp.task('default', ['bower', 'icons', 'images', 'js', 'js-minify', 'browser-sync', 'watch']);
