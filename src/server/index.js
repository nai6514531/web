import 'babel-polyfill'
import co from 'co'
import config from 'config'
import Koa from 'koa'
import graceful from 'graceful'
import path from 'path'
import rt from 'koa-response-time'
import logger from 'koa-logger'
import favicon from 'koa-favicon'

const env = process.env.NODE_ENV
const isProduction = env === 'production'
const isTest = env === 'test'

module.exports = co(async function () {
  let app = new Koa()
  let server

  // start server
  (function () {
    let name = config.get('package.name')
    let hostname = config.get('server.host')
    let port = config.get('server.port')
    if (!isTest) {
      server = app.listen(port, hostname, function() {
        console.log('%s server listening on %s with port %s (pid.%s)', name, hostname, server.address().port, process.pid)
      })
    }
  })()

  // settings
  app.name = config.get('package.name')
  app.keys = config.get('server.keys')
  app.proxy = true

  // log
  app.use(rt())
  app.use(logger())
  
  // favicon
  app.use(favicon(path.resolve(__dirname, isProduction ? '../../build/static/vendors/favicon.ico' : '../static/application/vendors/favicon.ico')))

  // import applications
  require('./mounts')(app)

  // graceful
  graceful({
    servers: [server],
    killTimeout: '30s'
  })

  // onerror
  app.on('error', function (err) {
    console.error('[server error]', err.stack)
  })

  return app
}).catch(function (err) {
  console.log('[global error] ', err.stack)
})
