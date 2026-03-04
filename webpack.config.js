const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin  } = require('clean-webpack-plugin')
const copyWebpackPlugin = require('copy-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const webpack = require('webpack');
const { resolve } = require('path');
const fs = require('fs');

const CLIENT_IDS = {
    local: '313065344975-ilu2brv8o8hdv00ni6rjk1mhesh1uabl.apps.googleusercontent.com',
    prod:  '313065344975-k6uda6csaampc8g7i98qpoko9q7fmcr7.apps.googleusercontent.com',
};

// Read version from manifest.json
const manifest = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf8'));
const version = manifest.version || '1.0.0';

// webpack plugin to log the build progress

module.exports = (env = {}) => {
const clientId = env.prod ? CLIENT_IDS.prod : CLIENT_IDS.local;

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
                from: 'public',
                to: '.',
                filter: str => !/\.raw.html$/.test(str),
                transform(content, resourcePath) {
                    if (!resourcePath.endsWith('manifest.json')) return content;
                    const json = JSON.parse(content.toString());
                    json.oauth2.client_id = clientId;
                    return JSON.stringify(json, null, 4);
                }
            }
        ]
    }),
    new CleanWebpackPlugin()
];

return {
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
};


