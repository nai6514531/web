import { message } from 'antd'
import elementService from '../../services/soda-manager/element.js'
import { cloneDeep } from 'lodash'

const model = {
  key: 1,
  visible: false,
  record: {},
  data: {
    objects: []
  }
}

export default {
  namespace: 'element',
  state: cloneDeep(model),
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
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(elementService.list)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(elementService.update, data, id)
      if(result.status == 'OK') {
        yield put({ type: 'list' })
        yield put({ type: 'hideModal' })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const result = yield call(elementService.add, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'list' })
        yield put({ type: 'hideModal' })
        message.success('添加成功')
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload }, { call, put }) {
      const result = yield call(elementService.delete, payload.id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({ type: 'list' })
      } else {
        message.error(result.message)
      }
    }
  }
}
