var gulp = require('gulp');

var source = require('vinyl-source-stream');
var browserify = require('browserify');
var tsify = require('tsify');
var babelify = require('babelify');

var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');

var config = {
    publicPath: __dirname + '/app/dist',
    app: {
        path: __dirname + '/src',
        main: 'main.ts',
        result: 'main.js'
    }
};

gulp.task("bower-files", function(){
    return gulp.src(mainBowerFiles({
            "overrides": {
                "ROT.js": {
                    "main": {
                        "development": "rot.js",
                        "production": "rot.js",
                    }
                }
            }
        }))
        .pipe(gulp.dest(config.publicPath));
});

gulp.task('compile-js', function() {
    return browserify({
            basedir: config.app.path,
            extensions: ['.js', '.ts', '.json'],
            debug: true
        })
        .plugin(tsify, {target: 'es6'})
        .transform(babelify.configure({
            extensions: ['.js', '.ts', '.json'],
            presets: ["es2015"]
        }))
        .add(config.app.path + '/' + config.app.main)
        .bundle()
        .on('error', function(err) {
            console.log(err.toString())
        })
        .pipe(source(config.app.result))
        .pipe(gulp.dest(config.publicPath));
});


/*
gulp.task('compile-js', function() {
    var bundler = browserify({
    		basedir: config.app.path,
    		debug: true
    	})
        .add(config.app.path + '/' + config.app.main)
        .plugin(tsify, {target: 'es6'})
        .transform(babelify.configure({
            extensions: ['.js', '.ts', '.json'],
            presets: ["es2015"]
        }));

    return bundler.bundle()
        .on('error', function(err) {
            console.log(err.toString())
        })
        .pipe(source(config.app.result))
        .pipe(gulp.dest(config.publicPath));
});
*/

gulp.task('watch', function () {
    gulp.watch('src/**/*.ts', ['compile-js']);
});

gulp.task('default', ['watch']);
