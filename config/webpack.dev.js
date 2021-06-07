const { merge } = require('webpack-merge');
const path = require('path');

const dist = path.resolve(__dirname, '../dist');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const config = require('./webpack.config');

module.exports = merge(config, {
  mode: 'development',
  devServer: {
    contentBase: dist,
    hot: true
  },
  target: 'web',
  plugins: [new ReactRefreshWebpackPlugin(), new CleanWebpackPlugin()]
});
