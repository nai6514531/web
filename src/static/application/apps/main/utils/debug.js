import moment from 'moment'
import querystring from 'querystring'

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

export const isDebug = isDevelopment || ('debug' in qs)

export const __scene = qs.__scene

let _API_SERVER = ""

switch (env.ENV) {
  case ENVIRONMENT.PRODUCTION:
    _API_SERVER = '//api.erp.sodalife.xyz/v1'
    break
  case ENVIRONMENT.STAGING:
    _API_SERVER = '//api.erp.sodalife.club/v1'
    break
  default:
    _API_SERVER = '//api.erp.sodalife.dev/v1'
}

export const API_SERVER = _API_SERVER

if (isDebug || isStaging) {
  console.log(
    `-----===== ${env.PKG_NAME} =====-----

  [包名] ${env.PKG_NAME}
  [编译环境] ${env.ENV || '无'}
  [最近编译时间] ${moment(env.BUILT_AT).format('YYYY-MM-DD HH:mm:ss')}

  .....----- ${env.PKG_NAME.replace(/./g, '=')} -----.....
  `)
}
