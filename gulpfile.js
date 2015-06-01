'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var inject = require('gulp-inject');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var gulpif = require('gulp-if');
var useref = require('gulp-useref');
var minifyCss = require('gulp-minify-css');
var flatten = require('gulp-flatten');
var electron = require('gulp-electron');
var asar = require('gulp-asar');
var mainBowerFiles = require('main-bower-files');
var del = require('del');
var packageJson = require('./package.json');
var helper = require('./tools');

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

gulp.task('html', ['inject:css', 'fonts'], function () {
  var assets = useref.assets();
  return gulp.src(['dist/**/*.html'])
    .pipe(assets)
    //.pipe(gulpif('*.css', minifyCss()))
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

gulp.task('package', ['dependencies', 'build', 'html'], function (done) {
  var fs = require('fs');
  var copied = _.cloneDeep(packageJson);
  copied.main = copied.main.replace('dist/', '');
  fs.writeFileSync('dist/package.json', JSON.stringify(copied));
  helper({
    version: '0.27.1',
    platforms: ['win32', 'darwin', 'linux'],
    appName: 'Disclosure',
    release: './release',
    appPrefix: 'Quramy'
  }).once('darwin', function (executablePath) {
    gulp.src('dist/**/*')
      .pipe(gulp.dest(executablePath + '/Contents/Resources/app'))
    ;
  }).once('win32', function (executablePath) {
    gulp.src('dist/**/*')
      .pipe(gulp.dest(executablePath + '/resources/app'))
    ;
  }).once('linux', function (executablePath) {
    gulp.src('dist/**/*')
      .pipe(gulp.dest(executablePath + '/resources/app'))
    ;
  })
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


