'use strict';

var _ = require('lodash');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var merge = require('merge2');
var mainBowerFiles = require('main-bower-files');
var del = require('del');
var packageJson = require('./package.json');
var electronProcess = require('electron-connect').server.create();
var packager = require('electron-packager');
var path = require('path');

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
gulp.task('compile:scripts:watch', function (done) {
  gulp.src(['src/**/*.js', 'src/**/*.jsx'])
    .pipe($.watch(['src/**/*.js', 'src/**/*.jsx']))
    //.pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      stage: 0
    }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(serveDir))
  ;
  done();
});

gulp.task('compile:scripts', function () {
  return gulp.src(['src/**/*.js', 'src/**/*.jsx'])
    .pipe($.babel({
      stage: 0
    }))
    .pipe($.uglify())
    .pipe(gulp.dest(distDir))
  ;
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
gulp.task('html', ['inject:css', 'fonts'], function () {
  var assets = $.useref.assets();
  return gulp.src([serveDir + '/**/*.html'])
    .pipe(assets)
    //.pipe(gulpif('*.css', minifyCss()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest(distDir))
  ;
});

// Minify dependent modules.
gulp.task('bundle:dependencies', function () {
  var streams = [], dependencies = [];
  var defaultModules = ['assert', 'buffer', 'console', 'constants', 'crypto', 'domain', 'events', 'http', 'https', 'os', 'path', 'punycode', 'querystring', 'stream', 'string_decoder', 'timers', 'tty', 'url', 'util', 'vm', 'zlib'],
      electronModules = ['app', 'auto-updater', 'browser-window', 'content-tracing', 'dialog', 'global-shortcut', 'ipc', 'menu', 'menu-item', 'power-monitor', 'protocol', 'tray', 'remote', 'web-frame', 'clipboard', 'crash-reporter', 'native-image', 'screen', 'shell'];

  // Because Electron's node integration, bundle files don't need to include browser-specific shim.
  var excludeModules = defaultModules.concat(electronModules);

  for(var name in packageJson.dependencies) {
    dependencies.push(name);
  }

  // create a list of dependencies' main files
  var modules = dependencies.map(function (dep) {
    var packageJson = require(dep + '/package.json');
    var main;
    if(!packageJson.main) {
      main = ['index.js'];
    }else if(Array.isArray(packageJson.main)){
      main = packageJson.main;
    }else{
      main = [packageJson.main];
    }
    return {name: dep, main: main.map(function (it) {return path.basename(it);})};
  });

  // add babel/polyfill module
  modules.push({name: 'babel', main: ['polyfill.js']});

  // create bundle file and minify for each main files
  modules.forEach(function (it) {
    it.main.forEach(function (entry) {
      var b = browserify(
          'node_modules/' + it.name + '/' + entry, {
          detectGlobal: false,
          standalone: entry
        });
      excludeModules.forEach(function(moduleName) {b.exclude(moduleName)});
      streams.push(b.bundle()
          .pipe(source(entry))
          .pipe(buffer())
          .pipe($.uglify())
          .pipe(gulp.dest(distDir + '/node_modules/' + it.name))
      );
    });
    streams.push(
      // copy modules' package.json
      gulp.src('node_modules/' + it.name + '/package.json')
        .pipe(gulp.dest(distDir + '/node_modules/' + it.name))
    );
  });

  return merge(streams);
});

// Replace 'main' property of package.json
gulp.task('packageJson', ['bundle:dependencies'], function (done) {
  var fs = require('fs');
  var copied = _.cloneDeep(packageJson);
  copied.main = 'app.js';
  fs.writeFile('dist/package.json', JSON.stringify(copied), function () {
    done();
  });
});

// Package for each platforms
gulp.task('package', ['win32', 'darwin', 'linux'].map(function (platform) {
  var taskName = 'package:' + platform;
  gulp.task(taskName, ['build'], function (done) {
    packager({
      dir: distDir,
      name: 'Disclosure',
      arch: 'x64',
      platform: platform,
      out: releaseDir + '/' + platform,
      version: '0.28.1'
    }, function (err) {
      done();
    });
  });
  return taskName;
}));

gulp.task('build', ['html', 'packageJson', 'compile:scripts']);

gulp.task('watch', function () {
  gulp.watch(['src/styles/**/*.scss'], ['inject:css']);
});

gulp.task('serve', ['inject:css', 'compile:scripts:watch', 'watch'], function () {
  electronProcess.start();
  gulp.watch([serveDir + '/app.js', serveDir + '/browser/**/*.js'], electronProcess.restart);
  gulp.watch([serveDir + '/renderer/**.js', serveDir + '/index.html', serveDir + '/styles/**.css'], electronProcess.reload);
});

gulp.task('clean', function (done) {
  del([serveDir, distDir, releaseDir], function () {
    done();
  });
});

gulp.task('default', ['build']);

