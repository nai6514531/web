import { message } from 'antd'
import customerService from '../../../../services/crm/search/customer.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  },
}

export default {
  namespace: 'crmChipcard',
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
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(customerService.chipcardBillsList, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    }
  }
}
