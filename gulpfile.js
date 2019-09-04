const gulp = require('gulp')
const del = require('del')
const connect = require('gulp-connect')
const watch = require('gulp-watch')
const less = require('gulp-less')
const minifyCSS = require('gulp-csso')

gulp.task('server', function(done) {
    return connect.server({
        port: 9000,
        livereload: true,
        root: ['.', 'build']
    })
})

gulp.task('watch', function (done) {
    return watch(['./app/*.html'], ['html'])
})

gulp.task('clean', function(done) {
    return del('build/**', {force:true})
})

gulp.task('css', function(done) {
    return gulp.src('./css/**/*.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest('build/css'))
        .pipe(connect.reload())
})

gulp.task('assets', function(done) {
    return gulp.src('./assets/**/*')
        .pipe(gulp.dest('build/assets'))
        .pipe(connect.reload())
})

gulp.task('html', function(done) {
    return gulp.src('html/**/*.html')
        .pipe(gulp.dest('build'))
        .pipe(connect.reload())
})

gulp.task('lib', function(done) {
    return gulp.src('lib/**/*.js')
        .pipe(gulp.dest('build/lib'))
        .pipe(connect.reload())
})

gulp.task('src', function(done) {
    return gulp.src('src/**/*.js')
        .pipe(gulp.dest('build/scripts'))
        .pipe(connect.reload())
})

gulp.task('default', gulp.series(['clean', 'css', 'assets', 'html', 'lib', 'src']))
gulp.task('build', gulp.series(['default']))

gulp.task('watch-and-reload', function(done) {
    return watch(['css/**', 'assets/**', 'html/**', 'lib/**', 'src/**'], function() {
        (gulp.series('build'))()
    })
})

gulp.task('serve', gulp.series(['build', gulp.parallel(['server', 'watch-and-reload'])]))
