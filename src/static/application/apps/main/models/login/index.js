import loginService from '../../services/login'
import userService from '../../services/user'
import { message } from 'antd'
import { storage } from '../../utils/storage.js'
import { API_SERVER } from '../../utils/config'
export default {
  namespace: 'login',
  state: {
    pageLoading: false,
    captcha: `${API_SERVER}/captcha.png`,
    accountHelp: null,
    passwordHelp: null,
    captchaHelp: null
  },
  reducers: {
    captcha(state) {
      const captcha = `${API_SERVER}/captcha.png?${Date.now()}`
      return { ...state, captcha }
    },
    showLoading(state) {
      const pageLoading = true
      return { ...state, pageLoading }
    },
    hideLoading(state) {
      const pageLoading = false
      return { ...state, pageLoading }
    },
    handleHelp(state, payload) {
      return { ...state, ...payload.payload }
    }
  },
  effects: {
    *login ({
      payload,
    }, { put, call }) {
      const data = yield call(loginService.login, payload.data)
      if(data.status == 'OK') {
        //登录成功后存储账户密码token等
        if(payload.data.checked) {
          storage.val('login', payload.data)
        } else {
          storage.clear('login')
        }
        storage.val('token', data.data)
        // 获取用户信息
        yield put({ type: 'showLoading' })
        const result = yield call(userService.info)

        if(result.status === 'OK') {
          storage.val('userInfo', result.data)
          payload.history.push('/admin')
        } else {
          message.error(result.message)
        }

        yield put({ type: 'hideLoading' })

      } else {
        const captcha = `${API_SERVER}/captcha.png?${Date.now()}`
        let accountHelp = null
        let passwordHelp = null
        let captchaHelp = null
        if(data.status === 'NOT_FOUND_ENTITY' ) {
          accountHelp = {
            help: data.message,
            className:'has-error'
          }
        }
        if(data.status === 'UNPROCESSABLE_ENTITY' ) {
          passwordHelp = {
            help: data.message,
            className:'has-error'
          }
        }
        if(data.status === 'CAPTCHA_REQUIRED' ) {
          captchaHelp = {
            help: data.message,
            className:'has-error'
          }
        }
        const help = { accountHelp, passwordHelp, captchaHelp }
        yield put({ type: 'captcha', payload: { captcha } })
        yield put({ type: 'handleHelp', payload: help })
      }
    },
  }
}
