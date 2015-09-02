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
    return del([
        globalConfig.public.img,
        globalConfig.public.fonts,
        globalConfig.public.js
    ]);
});

gulp.task('clean:jsVendor', function() {
    return del([globalConfig.source.js + '/vendor']);
});





// Compile projects SASS files into single CSS file
gulp.task('sassGlobbing', function() {
    return gulp.src(
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
    return gulp.src(globalConfig.source.stylesheet)
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
    return gulp.src([
            globalConfig.source.js + '/vendor/libs/*.js',
            globalConfig.source.js + '/vendor/plugins/*.js',
        ])
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.uglify({
            preserveComments: 'license'
        }))
        .pipe(gulp.dest(globalConfig.cms.js));
});





// Copying tasks
gulp.task('copy:public', ['clean:public', 'injector'], function() {
    var stream = gulp.src([
            globalConfig.source.img + '/**/{.*,*,*/*}',
            globalConfig.source.fonts + '/**/{.*,*,*/*}',
            globalConfig.source.js + '/**/{.*,*,*/*}'
        ], {base: "./source"})
        .pipe(gulp.dest(globalConfig.public.public));
    return stream;
});

gulp.task('copy:public:img', function() {
    return gulp.src([
            globalConfig.source.img + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.img));
});

gulp.task('copy:public:fonts', function() {
    return gulp.src([
            globalConfig.source.fonts + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.fonts));
});

gulp.task('copy:public:js', function() {
    return gulp.src([
            globalConfig.source.js + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.js));
});

gulp.task('copy:public:pages', function() {
    return gulp.src([
            globalConfig.source.pages + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.public));
});

gulp.task('copy:cms:js', function() {
    return gulp.src([
            globalConfig.source.js + '/**/{.*,*,*/*}'
        ])
        .pipe(gulp.dest(globalConfig.public.js));
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
    gulp.watch([globalConfig.source.scss + '/**/*.scss', '!' + globalConfig.source.scss + '/_IMPORTS/*.scss'], ['sass:public']);
    gulp.watch(globalConfig.source.js + '/**/{.*,*,*/*}', ['copy:public:js']);
    gulp.watch(globalConfig.source.img + '/**/{.*,*,*/*}', ['copy:public:img']);
    gulp.watch(globalConfig.source.fonts + '/**/{.*,*,*/*}', ['copy:public:fonts']);
    gulp.watch(globalConfig.source.pages + '/**/{.*,*,*/*}', ['copy:public:pages']);
});





// Tasks
gulp.task('default', ['browser-sync', 'copy:public', 'sass:public', 'watch']);
gulp.task('cms', ['sass:cms', 'jsVendor', 'copy:cms']);
