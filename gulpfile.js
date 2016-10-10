var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    pug = require('gulp-pug');

gulp.task('pug', function() {
  gulp
    .src('./gulp/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./'));
});

gulp.task('webserver', function(){
  gulp
    .src('./')
    .pipe(webserver({
      port: 8080,
      livereload: true,
      directoryListing: false
    }));
})

gulp.task('watch',function(){
  gulp.watch('./gulp/*.pug',['pug']);
  gulp.watch('./css/*.css');
  gulp.watch('./js/*.js');
  gulp.watch('./*.html');
});

gulp.task('default',['pug','webserver','watch']);
