const _ = require('lodash')
const webpack = require('webpack')
const path = require('path')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const config = require('config')

const pkg = require('../package.json')

const APP_PATH = path.resolve(__dirname, '../application/apps')
const PUBLIC_PATH = '/static/apps/'

module.exports = function (options) {
  options = _.defaults(options || {}, {
    ENV: 'development'
  })

  const isProduction = options.ENV === 'production'

  const publicPath = isProduction ?
    config.get('resource.cdn.static.domain') + path.join(config.get('resource.cdn.static.path'), PUBLIC_PATH) :
    PUBLIC_PATH

  return {
    context: APP_PATH,
    entry: {
      main: './main/index.js',
    },
    output: {
      filename: 'entry/[name].js',
      chunkFilename: 'chunk/[name]-[chunkhash].js',
      publicPath: publicPath,
    },
    module: {
      loaders: [{
        test: /\.vue?$/,
        exclude: /node_modules/,
        loader: 'vue',
      }, {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
      }, {
        test: /\.css$/,
        loader: "style!css",
      }, {
        test: /\.pcss$/,
        loader: `style!css?module&importLoaders=1!postcss`,
      }, {
        test: /\.html$/,
        loader: "raw",
      }, {
        test: /\.(png|jpg|jpeg|gif|woff)$/,
        loader: "file?name=asset/[hash].[ext]",
      }]
    },
    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.vue'],
    },
    plugins: [
      new ProgressBarPlugin(),
      new webpack.DefinePlugin({
        'process.env': { // hard code for react
            NODE_ENV: JSON.stringify(options.ENV),
        },
        __ENV__: {
          ENV: JSON.stringify(options.ENV),
          BUILT_AT: JSON.stringify(+new Date()),
          PKG_NAME: JSON.stringify(pkg.name),
        },
      })
    ]
  }
}
