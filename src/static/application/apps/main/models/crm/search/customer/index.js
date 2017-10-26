import { message } from 'antd'
import customerService from '../../../../services/crm/search/customer.js'
import { cloneDeep } from 'lodash'

const model = {
  data: null,
  key: 1,
  visible: false,
}

export default {
  namespace: 'crmCustomer',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    showModal(state) {
      const visible = true
      return { ...state, visible }
    },
    hideModal(state) {
      const visible = false
      const key = state.key + 1
      return { ...state, visible, key }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(customerService.list, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *updatePassword({ payload: { data: { mobile, password } }}, { call, put }) {
      const result = yield call(customerService.updatePassword, mobile, { password })
      if(result.status == 'OK') {
        message.success('密码修改成功')
        yield put({ type: 'hideModal' })
      } else {
        message.error(result.message)
      }
    },
  }
}
