const gulp = require("gulp");
const gulpTypeScript = require("gulp-typescript");
const gulpSourceMaps = require("gulp-sourcemaps");
const gulpBabel = require("gulp-babel");
const merge = require("merge2");

const esmTSProject = gulpTypeScript.createProject("tsconfig.json", { declaration: true });
const umdTSProject = gulpTypeScript.createProject("tsconfig.json", { declaration: true });

gulp.task("build-esm", () => {
  const tsResult =
    esmTSProject.src()
      .pipe(gulpSourceMaps.init())
      .pipe(esmTSProject());

  return merge([
    tsResult.js
      .pipe(gulpBabel())
      .pipe(gulpSourceMaps.write("."))
      .pipe(gulp.dest("built/esm")),

    tsResult.dts
      .pipe(gulp.dest("built/esm"))
  ])
});

gulp.task("build-umd", () => {
  const tsResult =
    umdTSProject.src()
      .pipe(gulpSourceMaps.init())
      .pipe(umdTSProject());

  return merge([
    tsResult.js
      .pipe(gulpBabel({
        plugins: ["babel-plugin-transform-es2015-modules-umd"]
      }))
      .pipe(gulpSourceMaps.write("."))
      .pipe(gulp.dest("built/umd")),

    tsResult.dts
      .pipe(gulp.dest("built/umd"))
  ])
});
