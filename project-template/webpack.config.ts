import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import HtmlInlineScriptPlugin from "html-inline-script-webpack-plugin";
import HTMLInlineCSSWebpackPlugin from "html-inline-css-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import inlineFileTransformer from "ts-transformer-inline-file/transformer";
import { Program } from "typescript";
import webpack from "webpack";
//import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

const config: webpack.Configuration = {
    entry: "./src/iframe/index.ts",
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "bundle.js",
        assetModuleFilename: "static/[name][ext]",
        publicPath: "/"
    },
    optimization: {
        minimize: true
    },
    module: {
        rules: [{
            test: /\.(ts|tsx|js|jsx)$/,
            use: [{
                loader: "ts-loader",
                options: {
                    configFile: "tsconfig.webpack.json",
                    getCustomTransformers: (program: Program) => {
                        return {
                            before: [
                                inlineFileTransformer(program)
                            ]
                        };
                    }
                }
            }]
        },
        {
            test: /\.(png|jpg|gif|hdr)$/,
            type: "asset"
        },
        {
            test: /\.(mp3|ogg|wav)$/,
            loader: "file-loader",
            options: {
                name: "asset/audio/[name].[ext]?[hash]"
            }
        },
        {
            test: /\.html$/,
            use: [
                { loader: "html-loader" }
            ]
        },
        {
            test: /\.css$/,
            use: [
                {
                    loader: "style-loader",
                    options: {
                        injectType: "styleTag"
                    }
                },
                "css-loader"
            ]
        }
        ]
    },
    resolve: {
        modules: [path.join(__dirname, "src"), "node_modules"],
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        fallback: {
            fs: false,
            'path': false
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/iframe/index.html"
        }),
        new HtmlInlineScriptPlugin(),
        new HTMLInlineCSSWebpackPlugin(),
        new ESLintPlugin({
            extensions: ["ts", "tsx", "js", "jsx"]
        }),
        //new BundleAnalyzerPlugin()
    ],
    // devServer: {
    //     host: "0.0.0.0",
    //     allowedHosts: "all",
    //     port: 20310
    // },
    mode: "development"
};

export default config;
