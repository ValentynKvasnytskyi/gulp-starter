const gulp   		= require('gulp');
const browserSync   = require('browser-sync');
const sass   		= require('gulp-sass');
const concat 		= require('gulp-concat');
const sourcemaps    = require('gulp-sourcemaps');
const csso   		= require('gulp-csso');
const include     	= require('gulp-include');
const del     		= require('del');
const runSequence 	= require('run-sequence').use(gulp);
const fs 			= require('fs');
const wait 			= require('gulp-wait');
const pug			= require('gulp-pug');
const imagemin 		= require('gulp-imagemin');
const babel 		= require('gulp-babel');
const uglify 		= require('gulp-uglify');

let path = {
	src: {
		pug: [
			"./src/index.pug",
			"./src/views/pages/*.pug"
		],
		style: 'src/style/main.sass',
		scripts: 'src/js/main.js',
		img: 'src/img/*.+(jpg|jpeg|png|svg|ico|gif)',
		fonts: 'src/fonts/**/*',
	},
	dist: {
		pug: "./dist/",
		style: 'dist/css',
		scripts: 'dist/js/',
		img: 'dist/img',
		fonts: 'dist/fonts',
	},
	watch: {
		pug: "./src/**/*.pug",
		style: 'src/**/*.+(sass|scss)',
		scripts: 'src/**/*.js',
		img: 'src/img/*.+(jpg|jpeg|png|svg|ico|gif)',
		fonts: 'src/fonts/**/*'
	}
};

gulp.task('browser-sync', async function(){
	browserSync({
		server: {
			baseDir: 'dist'
		},
		notify: false,
		tunnel: false,
		port: 8000,
  		host: "localhost"
	});
});

gulp.task('pug', async function()  {
	return gulp.src(path.src.pug)
		.pipe(pug({
			pretty: true,
		}))
		.pipe(gulp.dest(path.dist.pug))
		.pipe(browserSync.stream());
});

gulp.task('style', async function(done){
	gulp.src(path.src.style)
		.pipe(sourcemaps.init())
  		.pipe(wait(100))
    	.pipe(sass().on('error', function(error) {
        	done(error);
      	}))
    	.pipe(concat('main.css'))
    	.pipe(csso({
    		// forceMediaMerge: true
    	}))
    	.pipe(sourcemaps.write())
    	.pipe(gulp.dest(path.dist.style))
    	.on('end', function() {
        	done();
      	})
    	.pipe(browserSync.reload({stream: true}));
});

gulp.task('scripts', async function() {
	return gulp.src(path.src.scripts)
		.pipe(sourcemaps.init())
		.pipe(include())
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(sourcemaps.write())
		// .pipe(concat('main.js'))
		.pipe(gulp.dest(path.dist.scripts))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('img', async function() {
	return gulp.src(path.src.img)
	  	.pipe(gulp.dest(path.dist.img))
	  	.pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts', async function() {
	return gulp.src(path.src.fonts)
	  	.pipe(gulp.dest(path.dist.fonts))
	  	.pipe(browserSync.reload({stream: true}));
});

gulp.task('build:style', async function(){
	return gulp.src(path.src.style)
		.pipe(sass())
		.pipe(concat('main.css'))
		.pipe(csso({
    		// forceMediaMerge: true
    	}))
		.pipe(gulp.dest(path.dist.style))
});

gulp.task('build:scripts', async function() {
	return gulp.src(path.src.scripts)
		.pipe(include())
		.pipe(babel({
			presets: ['@babel/env']
		}))
		// .pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest(path.dist.scripts))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('build:img', async function() {
	return gulp.src(path.src.img)
		.pipe(imagemin())
		.pipe(gulp.dest(path.dist.img))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('clean', async function() {
	return del.sync('dist/*')
});

const name = process.argv[process.argv.length - 1].split('--')[1];
const level = process.argv[process.argv.length - 1].split('--')[2];

gulp.task('folder', async function () {
    return gulp.src('*.*', {read: false})
        .pipe(gulp.dest('src/components/'+ name))
});

gulp.task('files', async function(name) {
	if (!level) {
		fs.writeFileSync('src/components/' + name + '/' + name + '.pug','')
		fs.writeFileSync('src/components/' + name + '/' + name + '.scss','')
	} else if (level == 1) {
		fs.writeFileSync('src/components/' + name + '/' + name + '.pug','')
		fs.writeFileSync('src/components/' + name + '/' + name + '.sass','')
	} else if (level == 2) {
		fs.writeFileSync('src/components/' + name + '/' + name + '.pug','')
		fs.writeFileSync('src/components/' + name + '/' + name + '.scss','')
		fs.writeFileSync('src/components/' + name + '/' + name + '.js','')
	} else if (level == 3) {
		fs.writeFileSync('src/components/' + name + '/' + name + '.pug','')
		fs.writeFileSync('src/components/' + name + '/' + name + '.sass','')
		fs.writeFileSync('src/components/' + name + '/' + name + '.js','')
	}
});

gulp.task('make',  function () {
	runSequence(gulp.series(gulp.parallel('folder','files')));
});

gulp.task('watch', gulp.series('clean','browser-sync', 'pug', 'style', 'scripts', 'img', 'fonts', function() {
	gulp.watch([path.watch.pug], gulp.series('pug'));
	gulp.watch([path.watch.style], gulp.series('style'));
	gulp.watch([path.watch.img], gulp.series('img'));
	gulp.watch([path.watch.scripts], gulp.series('scripts'));
	gulp.watch([path.watch.fonts], gulp.series('fonts'));
}));

gulp.task('build', gulp.series('clean', 'pug', 'build:style', 'build:scripts', 'build:img', 'fonts'));

gulp.task('default', gulp.series('watch'));
