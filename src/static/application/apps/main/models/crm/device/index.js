import { message } from 'antd'
import deviceService from '../../../services/crm/device.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  },
  selectedRowKeys: []
}

export default {
  namespace: 'crmDevice',
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
      const result = yield call(deviceService.list, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *status({ payload }, { call, put }) {
      const result = yield call(deviceService.status, payload.id, payload.data)
      if(result.status == 'OK') {
        message.success('操作成功')
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *reset({ payload }, { call, put }) {
      const result = yield call(deviceService.reset, payload.id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
