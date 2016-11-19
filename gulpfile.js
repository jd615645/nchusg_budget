var gulp = require('gulp');
// var path = require('path');
var $ = require('gulp-load-plugins')();

var paths = {
  src: {
    less  : './src/style/*.less',
    js    : './src/js/*.js',
    pug   : './src/pug/*.pug',
    images: './src/img/**',
    data: './src/data/**'
  },
  dist: {
    html  : './dist',
    css   : './dist/styles',
    js    : './dist/js',
    images: './dist/img',
    data: './dist/data'
  }
}

gulp.task('pug', function() {
  gulp.src(paths.src.pug)
      .pipe($.pug())
      .pipe(gulp.dest('./dist'));
});

gulp.task('less', function() {
  gulp.src(paths.src.less)
      .pipe($.less())
      .pipe(gulp.dest(paths.dist.css));
});

gulp.task('scripts', function() {
  gulp.src(paths.src.js)
      // .pipe($.uglify())
      .pipe(gulp.dest(paths.dist.js))
})

gulp.task('images', function() {
  gulp.src(paths.src.images)
      .pipe($.imagemin())
      .pipe(gulp.dest(paths.dist.images))
})

gulp.task('dataSrc', function(){
  gulp.src(paths.src.data)
      .pipe(gulp.dest(paths.dist.data))
})

gulp.task('webserver', function(){
  gulp.src(paths.dist.html)
      .pipe($.webserver({
        port: 8080,
        livereload: true,
        directoryListing: false
      }));
})

gulp.task('watch',function(){
  gulp.watch(paths.src.pug, ['pug'])
  gulp.watch(paths.src.less, ['less']);
  gulp.watch(paths.src.js, ['scripts']);
});

gulp.task('default', ['pug', 'less', 'scripts', 'dataSrc', 'webserver', 'watch']);
