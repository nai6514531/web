import km from 'keymirror'

import { isProduction, isStaging, isDevelopment} from '../utils/debug'

export const COOKIE = km({
  DEBUG: null
})

export const API_SERVER = isProduction ? '//api.erp.sodalife.xyz/v1' :
                          isStaging ? '//api.erp.sodalife.club/v1' : '//api.erp.sodalife.dev/v1'