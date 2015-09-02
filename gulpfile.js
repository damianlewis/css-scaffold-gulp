// var requireDir = require('require-dir');
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync');

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
        pages: 'source/pages'
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
    return del([globalConfig.public.public + '/**/{.*,*,*/*}']);
});

gulp.task('clean:jsVendor', function() {
    return del([globalConfig.source.js + '/vendor']);
});

gulp.task('clean:cms', function() {
    return del([globalConfig.cms.cms]);
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

gulp.task('sass:public', ['sassGlobbing'], function() {
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
        .pipe(gulp.dest(globalConfig.public.css));
    return stream;
});

gulp.task('sass:cms', function() {
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
            // globalConfig.bower + '/jquery/dist/jquery.js'
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
    var stream = gulp.src(globalConfig.source.pages + '/index.html')
        .pipe(plugins.inject(gulp.src(globalConfig.source.js + '/vendor', {read: false})))
        .pipe(gulp.dest(globalConfig.source.pages));
    return stream;
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
            globalConfig.source.img + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.img));
    return stream;
});

gulp.task('copy:public:fonts', function() {
    var stream = gulp.src([
            globalConfig.source.fonts + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.fonts));
    return stream;
});

gulp.task('copy:public:js', function() {
    var stream = gulp.src([
            globalConfig.source.js + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.js));
    return stream;
});

gulp.task('copy:public:pages', function() {
    var stream = gulp.src([
            globalConfig.source.pages + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.public));
    return stream;
});

gulp.task('copy:cms:js', function() {
    var stream = gulp.src([
            globalConfig.source.js + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.js));
    return stream;
});





// browser-sync task for starting the server.
gulp.task('browser-sync', function() {
    browserSync({
        proxy: "http://local.dev",
        files: [
            globalConfig.public.public + '/**/*',
        ],
        notify: false,
        open: false
    });
});






// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(globalConfig.source.scss + '/**/*.scss', ['sass:public']);
    gulp.watch(globalConfig.source.js + '/**/*.js', ['copy:public:js']);
    gulp.watch(globalConfig.source.img + '/**/*', ['copy:public:img']);
    gulp.watch(globalConfig.source.fonts + '/**/*', ['copy:public:fonts']);
    gulp.watch(globalConfig.source.pages + '/**/*', ['copy:public:pages']);
});





// Tasks
gulp.task('copy:public', ['copy:public:img', 'copy:public:fonts', 'copy:public:js', 'copy:public:pages']);
gulp.task('copy:cms', ['copy:cms:js']);
gulp.task('bowerInject', ['clean:jsVendor', 'bowerCopy:libs', 'bowerCopy:plugins', 'injector']);
gulp.task('default', ['clean:public', 'browser-sync', 'sass:public', 'bowerInject', 'copy:public', 'watch']);
gulp.task('cms', ['clean:cms', 'sass:cms', 'jsVendor', 'copy:cms']);
