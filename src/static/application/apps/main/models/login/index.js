import * as loginService from '../../services/login'
import { message } from 'antd'
import storage from '../../utils/storage.js'
import { API_SERVER } from '../../utils/config'
export default {
  namespace: 'login',
  state: {
    loading: false,
    captcha: `${API_SERVER}/captcha.png`
  },
  reducers: {
    captcha(state) {
      const captcha = `${API_SERVER}/captcha.png?${Date.now()}`
      return { ...state, captcha }
    }
  },
  effects: {
    *login ({
      payload,
    }, { put, call }) {
      const data = yield call(loginService.login, payload.data)
      if(data.status == 'OK') {
        if(payload.data.checked) {
          storage.val('login',payload.data)
        } else {
          storage.clear('login')
        }
        storage.val('token',data.data)
        payload.history.push('/admin')
      } else {
        const captcha = `${API_SERVER}/captcha.png?${Date.now()}`
        message.error(data.message)
        yield put({ type: 'captcha', payload: { captcha } })
      }
    },
  }
}
