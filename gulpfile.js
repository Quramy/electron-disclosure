'use strict';

var gulp = require('gulp');
var inject = require('gulp-inject');
var mainBowerFiles = require('main-bower-files');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');
var del = require('del');

gulp.task('inject:css', function() {
  return gulp.src('src/*.html')
    .pipe(inject(gulp.src(mainBowerFiles().concat(['src/**/*.css'])), {
      relative: true
    }))
    .pipe(gulp.dest('dist'))
  ;
});

gulp.task('misc', function () {
  return gulp.src(['src/**/*.css'])
    .pipe(gulp.dest('dist'))
  ;
});

gulp.task('clean', function (done) {
  del(['dist'], function () {
    done();
  });
});

gulp.task('compile', function () {
  return gulp.src(['src/**/*.js', 'src/**/*.jsx'])
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest('dist'))
  ;
});

gulp.task('watch', function () {
  gulp.watch(['src/**/*.jsx', 'src/**/*.js'], ['compile']);
  gulp.watch(['src/**/*.css'], ['misc', 'inject:css']);
  gulp.watch(['src/**/*.html'], ['inject:css']);
});

gulp.task('serve', ['build', 'watch']);

gulp.task('build', ['inject:css', 'compile', 'misc']);

gulp.task('default', ['build']);


