'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var mainBowerFiles = require('main-bower-files');
var del = require('del');
var packageJson = require('./package.json');
var helper = require('./tools/electron-package-helper');
var ELECTRON_MODULES = require('./electron-modules.json');

var serveDir    = '.serve';
var distDir     = 'dist';
var releaseDir  = 'release';

gulp.task('inject:css', function() {
  return gulp.src('src/*.html')
    .pipe($.inject(gulp.src(mainBowerFiles().concat(['styles/**/*.css'])), {
      relative: true
    }))
    .pipe(gulp.dest(serveDir))
  ;
});

gulp.task('compile', function () {
  return gulp.src(['src/**/*.js', 'src/**/*.jsx'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      stage: 0
    }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(serveDir))
  ;
});

gulp.task('bundle:browser', ['compile'], function () {
  var b = browserify({
    entries: [serveDir + '/browser/app.js'],
    detectGlobals: false
  });
  ELECTRON_MODULES.forEach(function(moduleName) {
    b.exclude(moduleName);
  });
  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest(distDir + '/browser'));
  ;
});

gulp.task('bundle:renderer', ['compile'], function () {
  var b = browserify({
    entries: [serveDir + '/renderer/bootstrap.js']
  });
  ELECTRON_MODULES.forEach(function (moduleName) {
    b.exclude(moduleName);
  });
  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest(distDir + '/renderer'))
  ;
});

gulp.task('packageJson', ['bundle:browser'], function (done) {
  var fs = require('fs');
  var copied = _.cloneDeep(packageJson);
  copied.main = 'browser/bundle.js';
  fs.writeFile('dist/package.json', JSON.stringify(copied), function () {
    done();
  });
});

gulp.task('fonts', function () {
  return gulp.src(['bower_components/**/fonts/*.woff'])
    .pipe($.flatten())
    .pipe(gulp.dest(distDir + '/fonts'))
  ;
});

gulp.task('html', ['inject:css', 'fonts', 'bundle:renderer'], function () {
  var assets = $.useref.assets();
  return gulp.src([serveDir + '/**/*.html'])
    .pipe($.inject(gulp.src(distDir + '/renderer/bundle.js'), {
      starttag: '<!-- inject:bundle.js -->',
      ignorePath: '../dist',
      relative: true
    }))
    .pipe(assets)
    //.pipe(gulpif('*.css', minifyCss()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest(distDir))
  ;
});

gulp.task('prepare.package', ['html', 'packageJson']);

gulp.task('package', ['prepare.package'], function (done) {
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
  del([serveDir, distDir, releaseDir], function () {
    done();
  });
});

gulp.task('default', ['build']);


