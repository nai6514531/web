import { message } from 'antd'
import circleService from '../../../services/2/circle.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {
    objects: []
  }
}
export default {
  namespace: 'circle',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload: { data } }) {
      return { ...state, data }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(circleService.list, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
    }
  }
}
