import { message } from 'antd'
import commentService from '../../../services/2/comment.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  }
}

export default {
  namespace: 'comment',
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
    *list({ payload }, { call, put, select }) {
      const result = yield call(commentService.list, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *updateStatus({ payload }, { call, put }) {
      const { id, data, url } = payload
      const result = yield call(commentService.updateStatus, id, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        yield put({
          type: 'list',
          payload: {
            data: url
          }
        })
      } else {
        message.error(result.message)
      }
    },
  }
}
