'use strict';

var gulp = require('gulp');
var inject = require('gulp-inject');
var mainBowerFiles = require('main-bower-files');

gulp.task('inject', function() {
  return gulp.src('src/*.html')
    .pipe(inject(gulp.src(mainBowerFiles().concat(['src/renderer/index.js', 'src/renderer/**/*.js', 'src/main.css'])), {
      relative: true
    }))
    .pipe(gulp.dest('src'))
  ;
});

