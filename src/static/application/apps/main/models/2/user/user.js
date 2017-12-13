import { message } from 'antd'
import userService from '../../../services/2/user.js'
import commentService from '../../../services/2/comment.js'
import likeService from '../../../services/2/like.js'
import replyService from '../../../services/2/reply.js'
import { storage, session } from '../../../utils/storage.js'
import { cloneDeep } from 'lodash'

const model = {
  key: 1,
  data: {
    objects: []
  },
  detail: {},
  previewVisible: false,
  previewImage: '',
}

export default {
  namespace: 'twoUser',
  state: cloneDeep(model),
  reducers: {
    showImageModal(state,{ payload: { previewImage } }) {
      const previewVisible = true
      return { ...state, previewVisible, previewImage }
    },
    hideModal(state) {
      const previewVisible = false
      const key = state.key + 1
      return { ...state, previewVisible, key }
    },
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      return model
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
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(userService.detail, id)
      const comment = yield call(commentService.list, {
        pagination:false,
        userId: id
      })
      const like = yield call(likeService.list, {
        pagination:false,
        userId: id
      })
      const reply = yield call(replyService.list, {
        pagination:false,
        userId: id
      })

      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { detail: result.data } })
      } else {
        message.error(result.message)
      }

      if(comment.status == 'OK') {
        result.data.commentCount = comment.data.pagination.total
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        comment.message && message.error(comment.message)
      }

      if(like.status == 'OK') {
        result.data.likeCount = like.data.pagination.total
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        like.message && message.error(like.message)
      }

      if(reply.status == 'OK') {
        result.data.replyCount = reply.data.pagination.total
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        reply.message && message.error(reply.message)
      }
    },
    *updateStatus({ payload }, { call, put }) {
      const { url, data, id } = payload
      const result = yield call(userService.updateStatus, data, id)
      if(result.status == 'OK') {
        yield put({
          type: 'list',
          payload: {
            data: url
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
