import moment from 'moment'
import querystring from 'querystring'
import cookie from 'component-cookie'

import platform from './platform'
import { COOKIE } from '../constant/cookie'

export const env = window.__ENV__ = __ENV__
const qs = querystring.parse(window.location.search.slice(1))

export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
}

export const isProduction = env.ENV === ENVIRONMENT.PRODUCTION
export const isStaging = env.ENV === ENVIRONMENT.STAGING
export const isDevelopment = env.ENV === ENVIRONMENT.DEVELOPMENT
export const isDebug = !!cookie(COOKIE.DEBUG)

if (isDebug || isDevelopment || isStaging) {
  console.log(
    `-----===== ${env.PKG_NAME} =====-----

  [包名] ${env.PKG_NAME}
  [编译环境] ${env.ENV || '无'}
  [最近编译时间] ${moment(env.BUILT_AT).format('YYYY-MM-DD HH:mm:ss')}

  .....----- ${env.PKG_NAME.replace(/./g, '=')} -----.....
  `)

  
}

// set eruda
if (isDebug) {
  require('bundle!eruda')((eruda) => eruda.init())
}