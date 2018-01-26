import mount from 'koa-mount'

module.exports = function (app) {

  app.use(mount('/MP_verify_Web8PBTLyZQ2Fyz8.txt', function (ctx) {
    ctx.body = 'Web8PBTLyZQ2Fyz8'
  }))

  app.use(mount('/', require('./application')))

}
