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
var argv = require('yargs').argv;
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');


// And some settings, probably do this in a different way soon.
var config = {
  "dist": "dist",
  "src": "src"
};

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
  return karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

/******************************************************************************/
/* Sass tasks */
/******************************************************************************/
gulp.task('sass', function() {
  return gulp.src(config.src + "/sass/*.scss")
    .pipe($.sass()
      .on('error', $.util.log))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(argv.production ? $.minifyCSS() : $.util.noop())
    .pipe(argv.production ? $.rev() : $.util.noop())
    .pipe(gulp.dest(config.src + "/css"));
});

/******************************************************************************/
/* Cleaning tasks */
/******************************************************************************/
gulp.task('clean', function() {
  return gulp.src(config.dist, {
    read: false
  }).pipe($.clean());
});

/******************************************************************************/
/* Compiling tasks */
/******************************************************************************/
gulp.task('webpack', function() {
  return gulp.src('src/scripts/TempoApp.js')
    .pipe($.webpack(require('./webpack.config.js')))
    .pipe(gulp.dest(config.dist + "/assets/"))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('copy', function() {
  return gulp.src([
      "src/*",
      "src/images/*",
      "src/css/*"
    ])
    .pipe($.copy(config.dist, {
      prefix: 1
    }));
});

gulp.task('build', ['lint', 'test', 'sass', 'copy', 'webpack']);
gulp.task('rebuild', ['lint', 'sass', 'copy', 'webpack']);


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


gulp.task('watch', function () {
  gulp.watch(config.src + "/sass/**/*.scss", ['sass', 'copy']);
  gulp.watch(config.src + "image/**/*", ['copy']);
  gulp.watch(config.src + "scripts/**/*", ['lint', 'webpack']);
});


gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: config.dist
    }
  });
});

gulp.task('server', ['build', 'browserSync']);
