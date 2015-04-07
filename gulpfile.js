'use strict';

/**
 * Gulp task definitions.
 */

var gulp = require('gulp');
// Loads all plugins that are gulp-*
var $ = require('gulp-load-plugins')();

var merge = require('merge-stream');
var stylish = require('jshint-stylish');
var karma = require('karma').server;

/**
 * Default task
 *
 * Just lists out all other tasks.
 */
gulp.task('default', $.taskListing);

/**
 *
 */
var jsFileStream = (function() {
  var js = gulp.src([
      "./*.js",
      "./components/**/*.js",
      "./lib/*.js",
      "./test/*.js",
      "!./opsworks.js"
    ]);
  var jsx = gulp.src('./components/**/*.jsx')
    .pipe($.react());

  return merge(js, jsx);
})();


/******************************************************************************/
/* Testing tasks */
/******************************************************************************/

gulp.task('lint', function () {
  jsFileStream
    .pipe($.jshint())
    .pipe($.jshint.reporter(stylish))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

/******************************************************************************/
/* Sass tasks */
/******************************************************************************/
gulp.task('sass', function() {
  return gulp.src('src/sass/main.scss')
    .pipe($.sass()
      .on('error', $.util.log))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.env.production ? $.minifyCSS() : $.util.noop())
    .pipe(gulp.env.production ? $.rev() : $.util.noop())
    .pipe(gulp.dest('dist/assets'));
});

/******************************************************************************/
/* Cleaning tasks */
/******************************************************************************/
gulp.task('clean', function() {
  return gulp.src('dist', {
    read: false
  }).pipe($.clean());
});

/******************************************************************************/
/* Compiling tasks */
/******************************************************************************/
gulp.task('webpack', function() {
  return gulp.src('browser.js')
    .pipe($.webpack(require('./webpack.config.js')))
    .pipe(gulp.dest('.'));
});

gulp.task('build', ['lint', 'test', 'webpack']);
gulp.task('rebuild', ['lint', 'webpack']);


/******************************************************************************/
/* Server  tasks */
/******************************************************************************/
gulp.task('browser', function () {
  var env = process.env.NODE_ENV || 'local';
  var opts = {
    script: 'render.js',
    ext: 'js jsx',
    ignore: ['static/*'],
    env: {
      NODE_ENV: env
    },
    nodeArgs: ['--debug']
  };
  console.log(opts);
  $.nodemon(opts)
    .on('start', ['build'])
    .on('change', ['build']);
});
