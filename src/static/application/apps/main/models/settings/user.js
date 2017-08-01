import { message } from 'antd'
import userService from '../../services/settings/user.js'
export default {
  namespace: 'user',
  state: {
    data: {
      objects: []
    }
  },
  reducers: {
    updateData(state, { payload: { data } }) {
      return { ...state, data }
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(userService.list, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload }, { call, put }) {
      const result = yield call(userService.detail, payload.id)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const result = yield call(userService.update, payload.data)
      if(result.status == 'OK') {
        payload.history.goBack()
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const result = yield call(userService.add, payload.data)
      if(result.status == 'OK') {
        payload.history.goBack()
        message.success('添加成功')
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(userService.delete, id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({
          type: 'list',
          payload: {
            data: data
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
