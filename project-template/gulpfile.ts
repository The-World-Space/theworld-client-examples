import gulp from "gulp";
import ts from "gulp-typescript";
import terser from "gulp-terser";
import rename from "gulp-rename";
import webpack from "webpack";
import webpackConfig from "./webpack.config";
import webpackStream from "webpack-stream";
import eslint from "gulp-eslint-new";
const rollup = require("gulp-rollup");
const webserver = require("gulp-webserver");

const pluginTsProject = ts.createProject("tsconfig.json", {
    target: "es5",
    declaration: false
});

gulp.task("plugin", (done): NodeJS.ReadWriteStream => {
    return gulp.src("src/plugin/**/*.ts")
        .pipe(eslint({
            fix: true,
            overrideConfig: {
                "plugins": [
                    "no-for-of-loops"
                ],
                "rules": {
                    "no-console": "error",
                    "no-debugger": "error",
                    "no-alert": "error",
                    "no-for-of-loops/no-for-of-loops": "error"
                }
            }
        }))
        .pipe(eslint.fix())
        .pipe(eslint.format())
        .pipe(pluginTsProject()
            .on("error", (): void => {
                done();
            }))
        .pipe(eslint.failAfterError()
            .on("error", (): void => {
                done();
            }))
        .pipe(terser({ compress: true }))
        .pipe(rollup({
            input: "./src/plugin/index.js",
            output: {
                format: "iife"
            },
            context: "this"
        }))
        .pipe(rename("plugin.js"))
        .pipe(gulp.dest("src/iframe"));
});

gulp.task("watch-plugin", gulp.series("plugin", function watch(): void {
    gulp.watch("src/plugin/**/*", gulp.series("plugin"));
}));

gulp.task("iframe", (done): NodeJS.ReadWriteStream => {
    return gulp.src("src/iframe/index.ts")
        .pipe(webpackStream(webpackConfig, webpack as any)
            .on("error", (): void => {
                done();
            }))
        .pipe(gulp.dest("dist/"));
});

gulp.task("watch-iframe", gulp.series("iframe", function watch(): void {
    gulp.watch("src/iframe/**/*", gulp.series("iframe"));
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
