import { message } from 'antd'
import menuService from '../../services/permission/menu.js'
export default {
  namespace: 'menu',
  state: {
    key: 1,
    visible: false,
    record: {},
    data: {
      objects: []
    }
  },
  reducers: {
    showModal(state, { payload: { data } }) {
      const record = data
      const visible = true
      return { ...state, visible, record }
    },
    hideModal(state) {
      const visible = false
      const key = state.key + 1
      return { ...state, visible, key }
    },
    updateData(state, { payload: { data } }) {
      return { ...state, data }
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(menuService.list)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const result = yield call(menuService.update, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'list' })
        yield put({ type: 'hideModal' })
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const result = yield call(menuService.add, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'list' })
        yield put({ type: 'hideModal' })
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload }, { call, put }) {
      const result = yield call(menuService.delete, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'list' })
      } else {
        message.error(result.message)
      }
    }
  }
}
