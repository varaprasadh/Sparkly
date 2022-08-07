const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin  } = require('clean-webpack-plugin')
const copyWebpackPlugin = require('copy-webpack-plugin')
const { resolve } = require('path');


const plugins = [
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
                test: /\.(png|jpe?g|gif|webp)$/i,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: 'images/[name].[ext]'
                    }
                }
            },
        ]
    },
    plugins
};



