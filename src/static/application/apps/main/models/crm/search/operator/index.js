import { message } from 'antd'
import operatorService from '../../../../services/crm/search/operator.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {
    objects: []
  }
}
export default {
  namespace: 'crmOperator',
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
      const result = yield call(operatorService.list, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    }
  }
}
