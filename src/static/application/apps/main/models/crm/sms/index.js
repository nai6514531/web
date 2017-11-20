import { message } from 'antd'
import commonService from '../../../services/common.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  }
}

export default {
  namespace: 'crmSms',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      model.appData = state.appData
      model.postionData = state.postionData
      return model
    }
  },
  effects: {
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(commonService.smsList, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    }
  }
}
