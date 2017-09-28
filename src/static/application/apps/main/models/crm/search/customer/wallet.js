import { message } from 'antd'
import customerService from '../../../../services/crm/search/customer.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {
    objects: []
  },
}
export default {
  namespace: 'crmWallet',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload: { data: { mobile, url } } }, { call, put }) {
      const result = yield call(customerService.walletsList, mobile, url)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    }
  }
}
