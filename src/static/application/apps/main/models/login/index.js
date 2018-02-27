import commonService from '../../services/common.js'
import { message } from 'antd'
import { storage } from '../../utils/storage.js'
import { API_SERVER } from '../../constant/index'

export default {
  namespace: 'login',
  state: {
    captcha: ``,
    accountHelp: null,
    passwordHelp: null,
    captchaHelp: null
  },
  reducers: {
    // captcha(state) {
    //   const captcha = `${API_SERVER}/captcha?${Date.now()}`
    //   return { ...state, captcha }
    // },
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
  },
  effects: {
    *captcha ({ payload }, { put, call }) {
      const result = yield call(commonService.captcha)
      if( result.status === 'OK' ) {
        yield put({ type: 'updateData', payload: { captcha: result.data } })
      } else {
        yield put({ type: 'updateData', payload: { captchaHelp: result.message } })
      }
    },
    *login ({
      payload,
    }, { put, call }) {
      let [ accountHelp, passwordHelp, captchaHelp ] = [ null, null, null ]
      const originData = _.cloneDeep(payload.data)
      delete originData.initPassword
      delete originData.code
      const data = yield call(commonService.login, originData)
      if(data.status == 'OK') {
        //登录成功后存储账户密码token等
        if(payload.data.checked) {
          storage.val('login', payload.data)
        } else {
          storage.clear('login')
        }
        const help = { accountHelp, passwordHelp, captchaHelp }
        yield put({ type: 'updateData', payload: help })
        storage.val('token', data.data)
        payload.history.push('/admin')

      } else {
        if(data.status === 'NOT_FOUND_ENTITY' ) {
          accountHelp = {
            help: data.message,
            className:'has-error'
          }
        } else if(data.status === 'UNPROCESSABLE_ENTITY' ) {
          passwordHelp = {
            help: data.message,
            className:'has-error'
          }
        } else if(data.status === 'INVALID_CODE' ) {
          captchaHelp = {
            help: data.message,
            className:'has-error'
          }
        } else {
          message.error(data.message)
        }
        const help = { accountHelp, passwordHelp, captchaHelp }
        yield put({ type: 'captcha' })
        yield put({ type: 'updateData', payload: help })
      }
    }
  }
}
