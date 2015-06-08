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
var electron = require('electron-prebuilt');
var proc = require('child_process');
var helper = require('./tools/electron-package-helper');
var ELECTRON_MODULES = require('./electron-modules.json');

var serveDir    = '.serve';
var distDir     = 'dist';
var releaseDir  = 'release';

// Compile *.scss files with sourcemaps
gulp.task('compile:styles', function () {
  return gulp.src(['src/styles/**/*.scss'])
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(serveDir + '/styles'))
    ;
});

// Inject *.css(compiled and depedent) files into *.html
gulp.task('inject:css', ['compile:styles'], function() {
  return gulp.src('src/**/*.html')
    .pipe($.inject(gulp.src(mainBowerFiles().concat([serveDir + '/styles/**/*.css'])), {
      relative: true,
      ignorePath: ['../.serve/']
    }))
    .pipe(gulp.dest(serveDir))
  ;
});

// Transform from ES6 fashion JSX files to ES5 JavaScript files
gulp.task('compile:scripts', function () {
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

// Browserify 2 bundle files(for BrowserProccess and for RendererProcess)
[{
  suffix: 'browser', 
  entries: [serveDir + '/app.js'],
  dest: distDir
}, {
  suffix: 'renderer',
  entries: [serveDir + '/renderer/bootstrap.js'],
  dest: distDir + '/renderer'
}].forEach(function (it){
  gulp.task('bundle:' + it.suffix, ['compile:scripts'], function () {
    var b = browserify({
      entries: it.entries,
      detectGlobals: false
    });
    ELECTRON_MODULES.concat(['ws', 'http', 'url', 'stream', 'events']).forEach(function(moduleName) {
      // exclude built-in Electron modules (e.g. 'app', 'remote', etc...)
      b.exclude(moduleName);
    });
    return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    //.pipe($.uglify())
    .pipe(gulp.dest(it.dest));
    ;
  });
});

// Replace 'main' property of package.json
gulp.task('packageJson', ['bundle:browser'], function (done) {
  var fs = require('fs');
  var copied = _.cloneDeep(packageJson);
  copied.main = 'bundle.js';
  fs.writeFile('dist/package.json', JSON.stringify(copied), function () {
    done();
  });
});

// Copy font file. 
// You don't need copy *.svg, *eot, *.ttf.
gulp.task('fonts', function () {
  return gulp.src(['bower_components/**/fonts/*.woff'])
    .pipe($.flatten())
    .pipe(gulp.dest(distDir + '/fonts'))
  ;
});

// Inject renderer bundle file and concatnate *.css files
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

// Make app.asar and deploy it into application packages for each platforms.
gulp.task('package', ['prepare.package'], function (done) {
  helper({
    version: '0.27.1',
    platforms: ['win32', 'darwin', 'linux'],
    appName: 'Disclosure',
    release: './release',
    appPrefix: 'Quramy'
  }).once('darwin', function (executablePath) {
    gulp.src('dist/**/*')
      .pipe($.asar('app.asar'))
      .pipe(gulp.dest(executablePath + '/Contents/Resources'))
    ;
  }).once('win32', function (executablePath) {
    gulp.src('dist/**/*')
      .pipe($.asar('app.asar'))
      .pipe(gulp.dest(executablePath + '/resources'))
    ;
  }).once('linux', function (executablePath) {
    gulp.src('dist/**/*')
      .pipe($.asar('app.asar'))
      .pipe(gulp.dest(executablePath + '/resources'))
    ;
  })
  ;
});

gulp.task('watch', function () {
  gulp.watch(['src/**/*.jsx', 'src/**/*.js'], ['compile:scripts']);
  gulp.watch(['src/styles/**/*.scss'], ['inject:css']);
});

gulp.task('build', ['inject:css', 'compile:scripts']);

var electronProc;
gulp.task('reload:browser', function () {
  if(electronProc) {
    electronProc.kill();
  }
  electronProc = proc.spawn(electron, [process.cwd()], {stdio: 'inherit'});
});

gulp.task('serve', ['build', 'watch'], function () {
  require('./tools/electron-devutil').start();
  electronProc = proc.spawn(electron, [process.cwd()], {stdio: 'inherit'});
  gulp.watch([serveDir + '/app.js'], ['reload:browser']);
});

gulp.task('clean', function (done) {
  del([serveDir, distDir, releaseDir], function () {
    done();
  });
});

gulp.task('default', ['build']);

