// include modules
let gulp = require('gulp'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    htmlmin = require('gulp-html-minifier-terser'),
    sass = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer').default,
    sourcemaps = require('gulp-sourcemaps'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    buffer = require('vinyl-buffer'),
    browserSync = require('browser-sync').create();
	
// js
function js() {
    return browserify({
        entries: ['./_js/script.js']
    })
    .transform(babelify.configure({
        presets : ['@babel/preset-env'],
        plugins : ['@babel/plugin-transform-runtime']
    }))
    .bundle()
    .on('error', function(err) { console.log(err.toString()); this.emit('end'); })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./_build'))
    .pipe(browserSync.reload({stream: true}));
}

// css
function css() {
    return gulp.src('./_scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            precision: 2
        }))
        .on('error', function(err) { console.log(err.toString()); this.emit('end'); })
        .pipe(autoprefixer({
            overrideBrowserslist: ['ie 9-10', 'last 2 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(rename('bundle.css'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('./_build'))
        .pipe(browserSync.stream());
}

// html
function html() {
  return gulp.src('./_html/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .on('error', function(err) { console.log(err.toString()); this.emit('end'); })
    .pipe(gulp.dest('./'))
    .pipe(browserSync.reload({stream: true}));
}

// watch
function watch() {
	browserSync.init({ proxy: 'cryptostats.local' });
    gulp.watch('./_js/*.js', js);
    gulp.watch('./_scss/**/*.scss', css);
    gulp.watch('./_html/*.html', html);
}

// default
gulp.task('js', js);
gulp.task('css', css);
gulp.task('html', html);
gulp.task('watch', watch);
gulp.task('default', gulp.series(gulp.parallel(js, css, html), watch));
