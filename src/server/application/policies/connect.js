import config from 'config'
import { isWechat } from '../utils/platform'

const COOKIE_IGNORE_WECHAT = 'ignore-wechat'
const COOKIE_IGNORE_WECHAT_IS_BASE = 'base'

function ignoreWechatBase (ctx) {
  return ctx.cookies.get(COOKIE_IGNORE_WECHAT) === COOKIE_IGNORE_WECHAT_IS_BASE
}

/**
 * 微信自动登录
 */
export async function connectWechat (ctx, next) {
  var url;
  if (isWechat(ctx.get('user-agent')) && ctx.session.openId && !ignoreWechatBase(ctx)) {
    url = '/connect/wechat?url=CURRENT_URL'

    return await ctx.render('redirect/main.ejs', {
      title: '微信登录',
      message: '连接登录中请稍候...',
      toUrl: url,
      encodeTimes: 1,
    })
  }
  await next()
}
