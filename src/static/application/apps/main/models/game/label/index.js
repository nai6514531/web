import { message } from 'antd'
import labelService from '../../../services/game/label.js'
import { cloneDeep, maxBy, merge } from 'lodash'
import moment from 'moment'

const model = {
  data: {
    objects: []
  },
  detail: {},
  allLabels: [],
}

export default {
  namespace: 'label',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      model.allLabels = state.allLabels      
      return model
    }
  },
  effects: {
    *allLabels({ payload }, { call, put }) {
      const result = yield call(labelService.list)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { allLabels: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
  }
}
