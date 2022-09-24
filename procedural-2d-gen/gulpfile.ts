var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
 
var tsProject = ts.createProject({
    declaration: true
});
 
gulp.task('plugin', function() {
    return gulp.src('lib/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));
});
 
gulp.task('watch', ['scripts'], function() {
    gulp.watch('lib/*.ts', ['scripts']);
});
