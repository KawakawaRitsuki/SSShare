
const gulp      = require('gulp'),
  $             = require('gulp-load-plugins')(),
  rimraf        = require('rimraf'),
  path          = require('path'),
  fs            = require('fs')

gulp.task('clean', () => rimraf.sync('public/*'))

gulp.task('ts', () => {
  gulp.src('./*.ts')
    .pipe($.typescript({
      "strict": true,
      "sourceMap": true,
      "module": "commonjs",
      "target": "es6",
      "lib": ["es2018", "dom"],
      "outDir":"dist",
      "removeComments": true,
      "experimentalDecorators": true
    }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('scss', () =>
  gulp.src('./scss/*')
  .pipe($.plumber())
  .pipe($.sass())
  .pipe($.autoprefixer())
  .pipe(gulp.dest('./public'))
)

gulp.task('res',() => {
  gulp.src('./res/**/*')
    .pipe(gulp.dest('./public'))
})

gulp.task('default', ['clean','scss','res'], () => {})

gulp.task('watch', ['default'], () => {
  gulp.watch('./scss/*',['scss'])
})
