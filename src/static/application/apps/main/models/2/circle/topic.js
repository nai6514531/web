import { message } from 'antd'
import circleService from '../../../services/2/circle.js'
import channelService from '../../../services/2/channel.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  },
  record: {},
  key: 1,
  visible: false,
  previewVisible: false,
  previewImage: '',
  channel: []
}
export default {
  namespace: 'topic',
  state: cloneDeep(model),
  reducers: {
    showModal(state, { payload: { data } }) {
      const record = data
      const visible = true
      return { ...state, visible, record }
    },
    showImageModal(state,{ payload: { previewImage } }) {
      const previewVisible = true
      return { ...state, previewVisible, previewImage }
    },
    hideModal(state) {
      const visible = false
      const previewVisible = false
      const key = state.key + 1
      return { ...state, visible, previewVisible, key }
    },
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload }, { call, put, select }) {
      const result = yield call(circleService.topicList, payload.data)
      if(result.status == 'OK') {
        result.data.objects.map(value => {
          let image = JSON.parse(value.images)[0]
          value.url = image ? image.url : ''
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *channelList({ payload }, { call, put, select }) {
      const result = yield call(channelService.list, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { channel: result.data.objects } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *updateStatus({ payload }, { call, put }) {
      const { id, data, url } = payload
      const result = yield call(circleService.upDateTopicStatus, id, data)
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
    *moveTopic({ payload }, { call, put }) {
      const { id, data: { values }, url } = payload
      const result = yield call(circleService.moveTopic, id, values)
      if(result.status == 'OK') {
        message.success('更新成功')
        yield put({ type: 'hideModal' })
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
