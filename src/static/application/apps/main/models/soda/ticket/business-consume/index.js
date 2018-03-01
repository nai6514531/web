import { message } from 'antd'
import sodaService from '../../../../services/soda/index.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  },
  visible: false,
  key: 0,
  exportUrl: '',
}

export default {
  namespace: 'businessConsume',
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
      model.appData = state.appData
      model.postionData = state.postionData
      return model
    }
  },
  effects: {
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(sodaService.ticketsList, data)
      if(result.status == 'OK') {
        let showError = true
        yield* result.data.objects.map(function* (value, index) {
          result.data.objects[index].key = index + 1 + Number(data.offset)
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *export({ payload: { data } }, { call, put }) {
      const result = yield call(sodaService.bizexport, data)
      if(result.status == 'OK') {
        yield put({ type: 'showModal' })
        yield put({ type: 'updateData', payload: { exportUrl: result.data.url } })
      } else {
        message.error(result.message)
      }
    },
    *refund({ payload: { id, data } }, { call, put }) {
      const result = yield call(sodaService.bizRefund, id)
      if(result.status == 'OK') {
        message.success('退款成功')
        yield put({
          type: 'list',
          payload: { data }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
