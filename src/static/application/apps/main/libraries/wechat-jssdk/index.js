import Promise from 'bluebird'
import axios from 'axios'
import load from 'load-script'
import { EventEmitter } from 'events'
import NProgress from 'nprogress'
import request from '../../utils/request'

const JSSDK_URL = '//res.wx.qq.com/open/js/jweixin-1.0.0.js'
const JSSDK_CONFIG_API = '/wechat/jssdk/config'
const JS_API_LIST = ['scanQRCode']
const WX_READY_TIMEOUT = 5000

class Sdk {
  constructor (options = { apis: JS_API_LIST, debug: false }) {
    this.config = {
      url: window.location.href.split('#')[0],
      jsApiList: options.apis,
      debug: options.debug,
    }
    this.sdk = void 0
  }

  load () {
    if (this.sdk) {
      return Promise.resolve()
    }
    return Promise.promisify(load)(JSSDK_URL)
      .then(() => {
        this.sdk = window.wx
        this.sdk.error(function(res){
          alert(JSON.stringify(res))
        })
        return
      })
  }

  ready () {
    return this.load().then(() => {
      if (this.config.signature) {
        return
      }
      return request.post(JSSDK_CONFIG_API, this.config)
        .then((response) => {
          let { data, status } = response
          if (status === 'OK' && data && data.signature) {
            this.config = {
              ...this.config,
              ...data,
            }
            this.sdk.config(this.config)
            return
          }

          NProgress.done()
          throw new Error('连接微信失败，请稍后重试')
        })
    }).then(() => {
      return new Promise((resolve, reject) => this.sdk.ready(resolve))
        .timeout(WX_READY_TIMEOUT)
        .catch((err) => {
          NProgress.done()
          throw(new Error('请在微信客户端中重试'))
        })
    })
  }

  scanQRCode (options = { needResult: 1, scanType: ['qrCode', 'barCode'] }) {
    NProgress.start()

    return this.ready()
      .then(() => {
        return new Promise((resolve, reject) => {
          let proxy = new EventEmitter()
          resolve(proxy)
          this.sdk.scanQRCode({
            needResult: options.needResult, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: options.scanType, // 可以指定扫二维码还是一维码，默认二者都有
            success: (res) => {
              NProgress.done()
              
              if (!res) {
                return proxy.emit('reject', new Error('微信扫描失败，请手动输入'))
              }
              proxy.emit('resolve', res.resultStr)
            },
            cancel: () => {
              NProgress.done()
              proxy.emit('resolve')
            },
          })
        })
      })
  }
}

export default new Sdk()
