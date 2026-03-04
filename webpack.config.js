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
            }
        ]
    }),
    new CleanWebpackPlugin()
];

module.exports = {
    mode:'production',
    devtool: 'cheap-module-source-map',
    entry:{
        newTab: './src/newTab/newTab.tsx',
        background: './src/background.ts'
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



