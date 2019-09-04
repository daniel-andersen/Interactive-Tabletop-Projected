var gulp = require('gulp')
var del = require('del')
var connect = require('gulp-connect')
var livereload = require('gulp-livereload')
var less = require('gulp-less')
var minifyCSS = require('gulp-csso')

gulp.task('webserver', function() {
    livereload({ start: true })
    connect.server({
        port: 9000,
        livereload: true,
        root: ['.', 'build']
    })
})

gulp.task('clean', function(done) {
    del('build/**', {force:true})
    done()
})

gulp.task('css', function(done) {
    gulp.src('./css/**/*.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(gulp.dest('build/css'))
        .pipe(livereload())
    done()
})

gulp.task('assets', function(done) {
    gulp.src('./assets/**/*')
        .pipe(gulp.dest('build/assets'))
        .pipe(livereload())
    done()
})

gulp.task('html', function(done) {
    gulp.src('html/**/*.html')
        .pipe(gulp.dest('build'))
        .pipe(livereload())
    done()
})

gulp.task('lib', function(done) {
    gulp.src('lib/**/*.js')
        .pipe(gulp.dest('build/lib'))
        .pipe(livereload())
    done()
})

gulp.task('src', function(done) {
    gulp.src('src/**/*.js')
        .pipe(gulp.dest('build/scripts'))
        .pipe(livereload())
    done()
})

gulp.task('default', gulp.series(['clean', 'css', 'assets', 'html', 'lib', 'src']))
gulp.task('build', gulp.series(['default']))
gulp.task('serve', gulp.series(['default', 'webserver']))
