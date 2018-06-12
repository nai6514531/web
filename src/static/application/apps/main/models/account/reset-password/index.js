import commonService from '../../../services/common.js'
import { message } from 'antd'
import { storage } from '../../../utils/storage.js'
import { API_SERVER } from '../../../constant/api'

const VERIFY_ACCOUNT = '验证身份'
const RESET_PASSWORD = '重置密码'
const DONE = '完成'

const model = {
  startedAt: 0,
  captcha: '',
  token: '',
  mobile: '',
  account: '',
  loading: false,
  current: VERIFY_ACCOUNT,
  isShowTip: false,
  errors: {
    smsCode: null,
    code: null,
    account: null,
  }
}
export default {
  namespace: 'resetPassword',
  state: model,
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload, errors: { ...state.errors, ...payload.errors, } }
    },
    clear() {
      return model
    },
  },
  effects: {
    *changeErrors ({ payload: { data } }, { put, call }) {
      yield put({ type: 'updateData', payload: { errors: { [`${data.field}`]: null } } })
    },
    *hideTip ({ payload }, { put, call }) {
      console.log(111)
      yield put({ type: 'updateData', payload: { isShowTip: false } })
    },
    *prev ({ payload }, { put, call }) {
      yield put({ type: 'updateData', payload: { ...payload.data, startedAt: 0 }})
      
    },
    *captcha ({ payload }, { put, call }) {
      yield put({ type: 'updateData', payload: { loading: true } })
      let { status, data, message } = yield call(commonService.captcha)
      if (status === 'OK' ) {
        yield put({ type: 'updateData', payload: { captcha: data, loading: false } })
      } else {
        yield put({ type: 'updateData', payload: { loading: false, errors: { code: { className: 'has-error', help: message }  } } })
      }
    },
    *smsCode ({ payload }, { put, call }) {
      yield put({ type: 'updateData', payload: { loading: true, errors: { smsCode: null } } })
      let { status, data, message } = yield call(commonService.sms, payload.data)
      yield put({ type: 'updateData', payload: { loading: false } })
      if (status == 'OK' ) {
        yield put({ type: 'updateData', payload: { startedAt: +new Date(), mobile: data.mobile, isShowTip: true } })
      } else {
        message.error(message)
        yield put({ type: 'captcha' })
      }
    },
    *verifyAccount ({ payload }, { put, call }) {
      yield put({ type: 'updateData', payload: { account: payload.data.account, loading: true, errors: { account: null, code: null, smsCode: null } } })
      let { status, data, message } = yield call(commonService.verfiyResetAccount, payload.data)
      if (status == 'OK') {
        yield put({ type: 'updateData', payload: { token: data.token, current: RESET_PASSWORD, loading: false } })
      } else {
        let field
        if (status === 'NOT_FOUND_ENTITY') {
          field = 'account'
        } else if (status === 'INVALID_CODE') {
          field = 'code'
        } else if (status === 'SMS_CODE_REQUIRED') {
          field = 'smsCode'
        } else {
          message.error(message)
        }
        yield put({ type: 'updateData', payload: { errors: { [`${field}`]: { className: 'has-error', help: message } }, loading: false } })
      }
    },
    *reset ({ payload }, { put, call }) {
      yield put({ type: 'updateData', payload: { loading: true } })
      let { status, data, message } = yield call(commonService.resetPassword, payload.data)
      if (status == 'OK') {
        yield put({ type: 'updateData', payload: { current: DONE, loading: false } })
      } else {
        message.error(message)
        yield put({ type: 'updateData', payload: { loading: false } })
      }
    }
  }
}
