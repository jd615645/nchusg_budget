const gulp = require('gulp')
const runSequence = require('run-sequence')
const ghPages = require('gulp-gh-pages')
const $ = require('gulp-load-plugins')()

const paths = {
  src: {
    less: './src/style/*.less',
    js: './src/js/*.js',
    pug: './src/pug/*.pug',
    images: './src/img/**',
    data: './src/data/**'
  },
  dist: {
    html: './dist',
    css: './dist/styles',
    js: './dist/js',
    images: './dist/img',
    data: './dist/data'
  }
}

gulp.task('pug', () => {
  gulp.src(paths.src.pug)
    .pipe($.pug())
    .pipe(gulp.dest('./dist'))
})

gulp.task('less', () => {
  gulp.src(paths.src.less)
    .pipe($.less())
    .pipe(gulp.dest(paths.dist.css))
})

gulp.task('scripts', () => {
  gulp.src(paths.src.js)
    // .pipe($.uglify())
    .pipe(gulp.dest(paths.dist.js))
})

gulp.task('images', () => {
  gulp.src(paths.src.images)
    .pipe($.imagemin())
    .pipe(gulp.dest(paths.dist.images))
})

gulp.task('dataSrc', () => {
  gulp.src(paths.src.data)
    .pipe(gulp.dest(paths.dist.data))
})

gulp.task('webserver', () => {
  gulp.src(paths.dist.html)
    .pipe($.webserver({
      port: 8080,
      livereload: true,
      directoryListing: false
    }))
})

gulp.task('deploy', () => {
  gulp.src('dist/**/*')
    .pipe(ghPages())
})

gulp.task('watch', () => {
  gulp.watch(paths.src.pug, ['pug'])
  gulp.watch(paths.src.less, ['less'])
  gulp.watch(paths.src.js, ['scripts'])
})

gulp.task('default', ['webserver', 'watch'])
gulp.task('build', ['pug', 'less', 'scripts', 'dataSrc'])
