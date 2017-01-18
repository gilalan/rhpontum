var gulp = require('gulp');
var jshint = require('gulp-jshint');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require('gulp-clean-css');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');

gulp.task('clean', function(){
	return gulp.src('public/dist/')
	.pipe(clean());
});

gulp.task('jshint', function() {
	return gulp.src('public/js/**/*.js')
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

gulp.task('uglify', function(){
	return gulp.src(['public/lib/**/*.js', 'public/js/**/*.js'])
	.pipe(uglify())
	.pipe(concat('scripts.js'))
	.pipe(gulp.dest('public/dist/js'));
});

gulp.task('htmlmin', function() {
	return gulp.src('public/view/*.html')
	.pipe(htmlmin({collapseWhitespace: true}))
	.pipe(gulp.dest('public/dist/view'))
});

gulp.task('cssmin', function(){
	return gulp.src('public/css/**/*.css')
	.pipe(cleanCSS())
	.pipe(concat('styles.min.css'))
	.pipe(gulp.dest('public/dist/css'))
});
//devemos mudar os imports no index-prod. eles devem apontar para os arquivos gerados
//tipo o scripts.js e o all.min.css por ex.
gulp.task('copy', function(){
	return gulp.src('public/index-prod.html')
	.pipe(rename('index.html'))
	.pipe(gulp.dest('public/dist/'))
})

gulp.task('default', function(cb) {
	return runSequence('clean', ['jshint', 'uglify', 'htmlmin', 'cssmin', 'copy'], cb) 	
});