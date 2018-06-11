const _ = require('lodash')
const webpack = require('webpack')
const path = require('path')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const config = require('config')
const fs = require('fs')
const lessToJs = require('less-vars-to-js')
const themeVariables = lessToJs(fs.readFileSync(path.join(__dirname, '../theme.less'), 'utf8'))

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
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
      }, {
        test: /\.css$/,
        loader: "style!css",
      }, {
        test: /\.less$/,
        loader: `style!css!less?{modifyVars:${JSON.stringify(themeVariables)}}`,
      }, {
        test: /\.pcss$/,
        loader: `style!css?module&importLoaders=1!postcss`,
      }, {
        test: /\.html$/,
        loader: "raw",
      }, {
        test: /\.(png|jpg|jpeg|gif|woff)$/,
        loader: "file?name=asset/[hash].[ext]",
      },{
        test: /\.json$/,
        loader: 'json-loader'
      }]
    },
    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.less'],
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
