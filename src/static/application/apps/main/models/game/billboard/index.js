import { message } from 'antd'
import billboardService from '../../../services/game/billboard.js'
import { cloneDeep, maxBy, merge } from 'lodash'
import moment from 'moment'

const model = {
  data: {
    objects: []
  },
  detail: {},
  allBillboards: [],
}

export default {
  namespace: 'billboard',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      model.allBillboards = state.allBillboards      
      return model
    }
  },
  effects: {
    *list({ payload: { data } }, { call, put, select }) {
      const result = yield call(billboardService.list, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
      const supplier = yield select(state => state.supplier);
    },
    *allBillboards({ payload }, { call, put }) {
      const result = yield call(billboardService.list)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { allBillboards: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
  }
}
