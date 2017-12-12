import { message } from 'antd'
import userService from '../../../services/2/user.js'
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
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { detail: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *updateStatus({ payload }, { call, put }) {
      const { history, data, id } = payload
      const result = yield call(userService.updateStatus, data, id)
      if(result.status == 'OK') {
        history.goBack()
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    }
  }
}
