'use strict';

var gulp = require('gulp');
var inject = require('gulp-inject');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var gulpif = require('gulp-if');
var useref = require('gulp-useref');
var minifyCss = require('gulp-minify-css');
var flatten = require('gulp-flatten');
var electron = require('gulp-electron');
var mainBowerFiles = require('main-bower-files');
var del = require('del');
var packageJson = require('./package.json');

gulp.task('inject:css', function() {
  return gulp.src('src/*.html')
    .pipe(inject(gulp.src(mainBowerFiles().concat(['styles/**/*.css'])), {
      relative: true
    }))
    .pipe(gulp.dest('dist'))
  ;
});

gulp.task('compile', function () {
  return gulp.src(['src/**/*.js', 'src/**/*.jsx'])
    .pipe(plumber())
    .pipe(babel({
      stage: 1
    }))
    .pipe(gulp.dest('dist'))
  ;
});

gulp.task('fonts', function () {
  return gulp.src(['bower_components/**/fonts/*.{eot,svg,ttf,woff,woff2,otf}'])
    .pipe(flatten())
    .pipe(gulp.dest('dist/fonts'))
  ;
});

gulp.task('html', ['inject:css'], function () {
  var assets = useref.assets();
  return gulp.src(['dist/**/*.html'])
    .pipe(assets)
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest('dist'))
  ;
});

gulp.task('dependencies', function () {
  var deps = [];
  for(var moduleName in packageJson.dependencies) {
    deps.push('node_modules/{' + moduleName + ',.tmp}/**/*')
  }
  return gulp.src(deps)
    .pipe(gulp.dest('dist/node_modules'))
  ;
});

gulp.task('package', ['dependencies', 'fonts', 'build'], function () {
  return gulp.src('')
    .pipe(electron({
      src: './dist',
      packageJson: packageJson,
      release: './release',
      cache: './cache',
      version: 'v0.26.1',
      packaging: true,
      platforms: ['win32-ia32', 'darwin-x64']
    }))
    .pipe(gulp.dest(''))
  ;
});

gulp.task('watch', function () {
  gulp.watch(['src/**/*.jsx', 'src/**/*.js'], ['compile']);
  gulp.watch(['styles/**/*.css'], ['inject:css']);
  gulp.watch(['src/**/*.html'], ['inject:css']);
});

gulp.task('build', ['inject:css', 'compile']);

gulp.task('serve', ['build', 'watch']);

gulp.task('clean', function (done) {
  del(['dist', 'release'], function () {
    done();
  });
});

gulp.task('default', ['build']);


