import commonService from '../../../services/common.js'
import { message } from 'antd'
import _ from 'underscore'
import { storage } from '../../../utils/storage.js'
import { API_SERVER } from '../../../constant/api'
import USER from '../../../constant/user'

export default {
  namespace: 'login',
  state: {
    startedAt: 0,
    captcha: ``,
    accountHelp: null,
    passwordHelp: null,
    captchaHelp: null,
    smsCodeHelp: null,
    smsLoading: false,
    showSmsCode: false
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
    *smsCode ({ payload: { data} }, { put, call }) {
      yield put({ type: 'updateData', payload: { smsLoading: true } })
      const result = yield call(commonService.sms, data)
      if( result.status === 'OK' ) {
        yield put({ type: 'updateData', payload: { startedAt: +new Date(), smsLoading: false  } })
      } else {
        yield put({ type: 'updateData', payload: { 
          startedAt: +new Date(), 
          smsLoading: false, 
          smsCodeHelp: {
            help: result.message,
            className:'has-error'
          }
        }})
      }
    },
    *checkAccount ({ payload: { data} }, { put, call }) {
      const result = yield call(commonService.verfiyAccount, data)
      if( result.status === 'OK' ) {
        const { data: isShowSmsCode } = result
        if (isShowSmsCode) {
          yield put({ type: 'updateData', payload: { showSmsCode: true, smsCodeHelp: null } })
        } else {
          yield put({ type: 'updateData', payload: { showSmsCode: false, smsCodeHelp: null } })
        }
      } else if (result.status === 'SMS_CODE_REQUIRED') {
        yield put({ type: 'updateData', payload: { 
          showSmsCode: true, 
          smsCodeHelp: {
            help: result.message,
            className:'has-error'
          }} 
        })
      } else {
        yield put({ type: 'updateData', payload: { showSmsCode: false, smsCodeHelp: null } })
      }
    },
    *login ({
      payload,
    }, { put, call }) {
      let [ accountHelp, passwordHelp, captchaHelp, smsCodeHelp ] = [ null, null, null ]
      const data = yield call(commonService.login, _.omit(payload.data, 'initPassword', 'checked'))
      if(data.status == 'OK') {
        //登录成功后存储账户密码token等
        if(payload.data.checked) {
          storage.val('login', payload.data)
        } else {
          storage.clear('login')
        }
        const help = { accountHelp, passwordHelp, captchaHelp, smsCodeHelp, startedAt: 0 }
        yield put({ type: 'updateData', payload: help })
        storage.val('token', data.data)
        payload.history.push('/admin')

      } else {
        if(data.status === 'NOT_FOUND_ENTITY') {
          accountHelp = {
            help: data.message,
            className:'has-error'
          }
        } else if(data.status === 'UNPROCESSABLE_ENTITY') {
          passwordHelp = {
            help: data.message,
            className:'has-error'
          }
        } else if(data.status === 'INVALID_CODE') {
          captchaHelp = {
            help: data.message,
            className:'has-error'
          }
        } else if(data.status === 'SMS_CODE_REQUIRED') {
          yield put({ type: 'updateData', payload: { showSmsCode: true } })
          smsCodeHelp = {
            help: data.message,
            className:'has-error'
          }
        } else {
          message.error(data.message)
        }
        const help = { accountHelp, passwordHelp, captchaHelp, smsCodeHelp }
        yield put({ type: 'captcha' })
        yield put({ type: 'updateData', payload: help })
      }
    }
  }
}
