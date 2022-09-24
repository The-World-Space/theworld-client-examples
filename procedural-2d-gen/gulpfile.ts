import gulp from "gulp";
import ts from "gulp-typescript";
import terser from "gulp-terser";
import rename from "gulp-rename";
import webpack from "webpack";
import webpackConfig from "./webpack.config";
import webpackStream from "webpack-stream";
const rollup = require("gulp-rollup");
const webserver = require("gulp-webserver");

const pluginTsProject = ts.createProject("tsconfig.json", {
    target: "es6",
    declaration: false
});

gulp.task("plugin", (): NodeJS.ReadWriteStream => {
    return gulp.src("src/plugin/**/*.ts")
        .pipe(pluginTsProject())
        .pipe(terser({ compress: true }))
        .pipe(rollup({
            input: "./src/plugin/index.js",
            output: {
                format: "iife"
            }
        }))
        .pipe(rename("plugin.js"))
        .pipe(gulp.dest("src/iframe"));
});

gulp.task("watch-plugin", gulp.series("plugin", function watch(): void {
    gulp.watch("src/plugin/**/*.ts", gulp.series("plugin"));
}));

gulp.task("iframe", (): NodeJS.ReadWriteStream => {
    return gulp.src("src/iframe/index.ts")
        .pipe(webpackStream(webpackConfig, webpack as any))
        .pipe(gulp.dest("dist/"));
});

gulp.task("watch-iframe", gulp.series("iframe", function watch(): void {
    gulp.watch("src/iframe/**/*.ts", gulp.series("iframe"));
}));

gulp.task("webserver", (): void => {
    gulp.src("./dist")
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            open: true,
            port: 20310,
            path: "dist",
            fallback: "index.html"
        }));
});

gulp.task("watch", gulp.parallel("watch-plugin", "watch-iframe", "webserver"));

gulp.task("build", gulp.series("plugin", "iframe"));
