import jssdk from '../libraries/wechat-jssdk'

import platform from '../utils/platform'
import { isDebug } from '../utils/debug'

const WechatService = {
  getQRCodeProxy: (options) => {
    if (platform.app.isWechat() || isDebug) {
      return jssdk.scanQRCode(options)
    }
    return Promise.reject(new Error('扫码功能暂只支持在微信内使用哦!'))
  }
}

export default WechatService
