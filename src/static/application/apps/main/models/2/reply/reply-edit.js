import { message } from 'antd'
import commentService from '../../../services/2/comment.js'
import replyService from '../../../services/2/reply.js'
import userService from '../../../services/2/user.js'
import { cloneDeep } from 'lodash'

const model = {
  toUser: '无',
  disabled: false,
  userData: [],
}

export default {
  namespace: 'replyEdit',
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
    *comment({ payload }, { call, put, select }) {
      const result = yield call(commentService.detail, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { toUser: result.data.content } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { data, history } = payload
      const result = yield call(replyService.add, payload.data)
      if(result.status == 'OK') {
        message.success('添加成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *userList({ payload }, { call, put }) {
      const result = yield call(userService.list, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { userData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    }
  }
}
