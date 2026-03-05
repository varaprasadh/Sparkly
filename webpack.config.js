const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin  } = require('clean-webpack-plugin')
const copyWebpackPlugin = require('copy-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const webpack = require('webpack');
const { resolve } = require('path');
const fs = require('fs');

// Read version from manifest.json
const manifest = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf8'));
const version = manifest.version || '1.0.0';

// webpack plugin to log the build progress

const plugins = [
    new ProgressBarPlugin(),
    new webpack.DefinePlugin({
        __VERSION__: JSON.stringify(version)
    }),
    new HtmlWebpackPlugin({
        template: './public/new-tab.raw.html',
        filename:'new-tab.html',
        chunks:['newTab']
    }),
    new copyWebpackPlugin({
        patterns:[
            {
                from: 'public', to: '.', filter:str=>!/\.raw.html$/.test(str)
            },
            // Bundle ONNX runtime WASM files locally so CSP allows them
            {
                from: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm',
                to: 'ort-wasm-simd-threaded.jsep.wasm'
            },
            {
                from: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm',
                to: 'ort-wasm-simd-threaded.wasm'
            },
            {
                from: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.mjs',
                to: 'ort-wasm-simd-threaded.jsep.mjs'
            },
            {
                from: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs',
                to: 'ort-wasm-simd-threaded.mjs'
            },
        ]
    }),
    new CleanWebpackPlugin()
];

module.exports = {
    mode:'production',
    devtool: 'cheap-module-source-map',
    entry:{
        newTab: './src/newTab/newTab.tsx',
        background: './src/background.ts',
        content: './src/content.ts',
        offscreen: './src/offscreen.ts'
    },
    output:{
        filename:'[name].js',
        path: resolve(__dirname,'dist')
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module:{
        rules:[
            {
                test:/\.ts(x?)$/,
                exclude:/node_modules/,
                use: 'ts-loader'
            },
            {
                test:/\.css$/,
                use: ['style-loader','css-loader']
            },
            {
                test: /\.(png|jpe?g|gif|webp|svg)$/i,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'images/[name].[ext]'
                    }
                }
            }
        ]
    },
    plugins,
};


