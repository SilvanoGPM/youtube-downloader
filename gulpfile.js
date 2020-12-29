const gulp = require('gulp');
const sass = require('gulp-sass');

const compileStyles = () => {
    return gulp
        .src('./src/scss/style.scss')
        .pipe(sass({
            noCache: true,
            precision: 4,
            outputStyle: 'expanded'
        }))
        .pipe(gulp.dest('./src/css'));
}

const watch = () => {
    gulp.watch('./src/scss/**/*.scss', compileStyles)
};

gulp.task('sass', compileStyles);
gulp.task('sass:watch', watch);