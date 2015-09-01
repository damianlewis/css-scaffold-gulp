// var requireDir = require('require-dir');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var globalConfig = {
    // Reference the path to the Bower components.
    bower: 'bower_components',

    // Reference the source paths.
    source: {
        source: 'source',
        scss: 'source/scss',
        stylesheet: 'source/scss/style.scss',
        js: 'source/js',
        fonts: 'source/fonts',
        img: 'source/img',
    },

    // Reference the public paths.
    public: {
        public: 'public',
        css: 'public/css',
        stylesheet: 'public/css/style.css',
        js: 'public/js',
        fonts: 'public/fonts',
        img: 'public/img',
    },

    // Adjust these values to the assets destination paths of your cms
    cms: {
        cms: 'cms',
        css: 'cms/css',
        stylesheet: 'cms/css/style.css',
        js: 'cms/js',
        fonts: 'cms/fonts'
    }
};





// Cleaning tasks
gulp.task('clean:public', function() {
    return del([globalConfig.public.public]);
});

gulp.task('clean:jsVendor', function() {
    return del([globalConfig.source.js + '/vendor']);
});





// Compile projects SASS files into single CSS file
gulp.task('sassGlobbing', function() {
    var stream = gulp.src(
        [
            globalConfig.source.scss + '/imports/_tools.imports.scss',
            globalConfig.source.scss + '/imports/_base.imports.scss',
            globalConfig.source.scss + '/imports/_objects.imports.scss',
            globalConfig.source.scss + '/imports/_components.imports.scss',
            globalConfig.source.scss + '/imports/_plugins.imports.scss',
            globalConfig.source.scss + '/imports/_trumps.imports.scss'
        ])
        .pipe(plugins.cssGlobbing({
            extensions: ['.scss'],
            scssImportPath: {
                leading_underscore: false
            }
        }))
        .pipe(gulp.dest(globalConfig.source.scss + '/_IMPORTS'));   
    return stream;
});

gulp.task('sass:public', ['clean:public', 'sassGlobbing'], function() {
    var stream = gulp.src(globalConfig.source.stylesheet)
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass({
                includePaths: 'bower_components/',
                sourceComments: true,
                sourcemap: false
            }))
            .pipe(plugins.autoprefixer({
                browsers: [
                    'last 3 versions',
                    'ie 9',
                    'ie 10'
                ],
            }))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(globalConfig.public.css))
    return stream;
});

gulp.task('sass:cms', ['sassGlobbing'], function() {
    var stream = gulp.src(globalConfig.source.stylesheet)
        .pipe(plugins.sass({
            includePaths: 'bower_components/',
            outputStyle: 'compressed',
            sourcemap: false
        }))
        .pipe(plugins.autoprefixer({
            browsers: [
                'last 3 versions',
                'ie 9',
                'ie 10'
            ],
        }))
        .pipe(gulp.dest(globalConfig.cms.css))
    return stream;
});




// Copy Bower dependancies to project vendor folders
gulp.task('bowerCopy:libs', ['clean:jsVendor'], function() {
    var stream = gulp.src([
            globalConfig.bower + '/jquery/dist/jquery.js'
        ])
        .pipe(gulp.dest(globalConfig.source.js + '/vendor/libs'));
    return stream;
});

gulp.task('bowerCopy:plugins', ['clean:jsVendor'], function() {
    var stream = gulp.src([
            // globalConfig.bower + '/mediaelement/build/mediaelement-and-player.js'
        ])
        .pipe(gulp.dest(globalConfig.source.js + '/vendor/plugins'));
    return stream;
});





// Inject compiles CSS and JS dependancies into HTML
gulp.task('injector', ['bowerCopy:libs', 'bowerCopy:plugins'], function() {
//     var stream = gulp.src(globalConfig.source.templates + '/templates/layouts/global.foot.php')
//         .pipe(plugins.inject(globalConfig.source.js + '/vendor'));
//         .pipe(gulp.dest(globalConfig.source.templates + '/templates/layouts'));
//     return stream;
});





// Complile JS vendor files for distribution
gulp.task('jsVendor', function() {
    var stream = gulp.src([
            globalConfig.source.js + '/vendor/libs/*.js',
            globalConfig.source.js + '/vendor/plugins/*.js',
        ])
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.uglify({
            preserveComments: 'license'
        }))
        .pipe(gulp.dest(globalConfig.cms.js));
    return stream;
});





// Copying tasks
gulp.task('copy:public:img', function() {
    var stream = gulp.src([
            globalConfig.source.img + '/**/*.*'
        ])
        .pipe(gulp.dest(globalConfig.public.img));
    return stream;
});

gulp.task('copy:public:fonts', function() {
    var stream = gulp.src([
            globalConfig.source.fonts + '/**/*.*'
        ])
        .pipe(gulp.dest(globalConfig.public.fonts));
    return stream;
});

gulp.task('copy:public:js', ['bowerCopy:libs', 'bowerCopy:plugins'], function() {
    var stream = gulp.src([
            globalConfig.source.js + '/**/*.*'
        ])
        .pipe(gulp.dest(globalConfig.public.js));
    return stream;
});

gulp.task('copy:cms:js', function() {
    var stream = gulp.src([
            globalConfig.source.js + '/*.js'
        ])
        .pipe(gulp.dest(globalConfig.public.js));
    return stream;
});




// Tasks
gulp.task('copy', ['copy:public:img', 'copy:public:fonts', 'copy:public:js', 'copy:cms:js']);
gulp.task('bowerInject', ['clean:jsVendor', 'bowerCopy:libs', 'bowerCopy:plugins', 'injector']);
gulp.task('default', ['clean:public', 'sassGlobbing', 'sass:public', 'bowerInject', 'copy', 'sass:cms', 'jsVendor']);
