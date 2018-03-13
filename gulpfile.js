const gulp = require("gulp");
const ts = require("gulp-typescript");
const babel = require("gulp-babel");
const merge = require("merge2");

const tsProject = ts.createProject("tsconfig.json");

gulp.task("build-lib", () => {
  const tsResult = tsProject.src()
    .pipe(tsProject());

  const jsStream = tsResult.js
    .pipe(babel())
    .pipe(gulp.dest("lib"));

  const dtsStream = tsResult.dts
    .pipe(gulp.dest("lib"));

  return merge([jsStream, dtsStream]);
});
