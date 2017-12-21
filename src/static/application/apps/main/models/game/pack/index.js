import { message } from 'antd'
import packService from '../../../services/game/pack.js'
import { cloneDeep, maxBy, merge } from 'lodash'
import moment from 'moment'

const model = {
  data: {
    objects: []
  },
  detail: {},
}

export default {
  namespace: 'pack',
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
      const result = yield call(packService.list, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(packService.detail, id)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { detail: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { data, id, history } = payload
      const result = yield call(packService.update, id, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
        const { data, history } = payload
        const result = yield call(packService.add, payload.data)
        if(result.status == 'OK') {
          message.success('添加成功')
          history.goBack()
        } else {
          message.error(result.message)
        }
    },
  }
}
