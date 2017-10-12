import { message } from 'antd'
import operatorService from '../../../../../services/crm/search/operator.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {},
  key: 1,
  visible: false,
}
export default {
  namespace: 'crmOperatorDetail',
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
    *detail({ payload: { data } }, { call, put }) {
      const result = yield call(operatorService.detail, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *updatePassword({ payload: { data: { id, password } }}, { call, put }) {
      const result = yield call(operatorService.updatePassword, id, { password })
      if(result.status == 'OK') {
        message.success('密码修改成功')
        yield put({ type: 'hideModal' })
      } else {
        message.error(result.message)
      }
    },
  }
}
