import { message } from 'antd'
import likeService from '../../../services/2/like.js'
import commentService from '../../../services/2/comment.js'
import replyService from '../../../services/2/reply.js'
import cityService from '../../../services/2/city.js'
import userService from '../../../services/2/user.js'
import { cloneDeep } from 'lodash'

const model = {
  realLikes: 0,
  virtualLikes: 0,
  content: '',
  maxLikes: 1
}

export default {
  namespace: 'likes',
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
      const result = yield call(likeService.list, payload.data)
      if(result.status == 'OK') {
        if(payload.data.isRobot === 0) {
          yield put({ type: 'updateData', payload: { realLikes: result.data.pagination.total } })
        }
        if(payload.data.isRobot === 1) {
          yield put({
            type: 'userList',
            payload: {
              data: {
                pagination: false,
                isOfficial: 1,
                total: result.data.pagination.total
              }
            }
          })
          yield put({ type: 'updateData', payload: { virtualLikes: result.data.pagination.total } })
        }

      } else {
        result.message && message.error(result.message)
      }
    },
    *userList({ payload }, { call, put }) {
      const result = yield call(userService.list, payload.data)
      if(result.status == 'OK') {
        const maxLikes = result.data.pagination.total - payload.data.total
        yield put({ type: 'updateData', payload: { maxLikes } })
      } else {
        message.error(result.message)
      }
    },
    *topic({ payload }, { call, put, select }) {
      const result = yield call(cityService.topicDetail, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { content: result.data.content } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *comment({ payload }, { call, put, select }) {
      const result = yield call(commentService.detail, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { content: result.data.content } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *reply({ payload }, { call, put, select }) {
      const result = yield call(replyService.detail, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { content: result.data.content } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *batchLike({ payload }, { call, put }) {
      const { data, history } = payload
      const result = yield call(likeService.batchLike, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
  }
}
