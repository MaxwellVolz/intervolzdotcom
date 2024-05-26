const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/', // Ensure this is set correctly for your environment
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' },
                { from: 'src/data', to: 'data' },
                { from: 'src/css', to: 'css' },
                { from: 'src/images', to: 'images' },
                { from: 'src/js', to: 'js' },
                { from: 'public/', to: '' }
            ]
        }),
    ],
    optimization: {
        minimize: false,
    },
    // optimization: {
    //     minimizer: [
    //         '...',
    //         new CssMinimizerPlugin(),
    //     ],
    // },
    devServer: {
        static: path.join(__dirname, 'public'),
        compress: true,
        port: 9000
    }
};
