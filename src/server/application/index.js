import Koa from 'koa'
import path from 'path'
import views from 'koa-views'
import convert from 'koa-convert'
import statics from 'koa-static-cache'
import config from 'config'

import routers from './routers'

const app = new Koa()

const env = process.env.NODE_ENV
const isProduction = env === 'production'

app.use(views(path.resolve(__dirname, isProduction ? '../../../build/static/templates' : '../../static/application/templates'), {
  map: {
    ejs: 'ejs'
  }
}))

app.use(convert(statics(path.resolve(__dirname, isProduction ? '../../../build/static/vendors' : '../../static/application/vendors'), {
  prefix: '/static/vendors',
  buffer: isProduction,
  dynamic: !isProduction,
  maxAge: isProduction ? 60 * 60 * 24 * 7 : 0
})))

app.use(convert(statics(path.resolve(__dirname, '../../../build/static/apps'), {
  prefix: '/static/apps',
  buffer: isProduction,
  dynamic: !isProduction,
  maxAge: isProduction ? 60 * 60 * 24 * 7 : 0
})))


app.use(routers.routes())

module.exports = app
