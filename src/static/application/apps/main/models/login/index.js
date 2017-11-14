import commonService from '../../services/common.js'
import { message } from 'antd'
import { storage } from '../../utils/storage.js'
import { API_SERVER } from '../../utils/debug'

export default {
  namespace: 'login',
  state: {
    captcha: ``,
    accountHelp: null,
    passwordHelp: null,
    captchaHelp: null
  },
  reducers: {
    captcha(state) {
      const captcha = `${API_SERVER}/captcha.png?${Date.now()}`
      return { ...state, captcha }
    },
    handleHelp(state, payload) {
      return { ...state, ...payload.payload }
    }
  },
  effects: {
    *login ({
      payload,
    }, { put, call }) {
      let [ accountHelp, passwordHelp, captchaHelp ] = [ null, null, null ]
      const originData = _.cloneDeep(payload.data)
      delete originData.initPassword
      const data = yield call(commonService.login, originData)
      if(data.status == 'OK') {
        //登录成功后存储账户密码token等
        if(payload.data.checked) {
          storage.val('login', payload.data)
        } else {
          storage.clear('login')
        }
        const help = { accountHelp, passwordHelp, captchaHelp }
        yield put({ type: 'handleHelp', payload: help })
        storage.val('token', data.data)
        payload.history.push('/admin')

      } else {
        const captcha = `${API_SERVER}/captcha.png?${Date.now()}`

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
    }
  }
}
