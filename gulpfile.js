const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');


gulp.task('default', function() {

    gulp.watch('scss/**/*.scss',['style']);
});


gulp.task('style', function() {
    gulp.src('sass/styles.scss')
        .pipe(sass({outputStyle:'compressed'}).on('error',sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('css'))
});