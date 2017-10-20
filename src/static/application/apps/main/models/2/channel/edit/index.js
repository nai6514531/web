import { message } from 'antd'
import adConfigService from '../../../../services/advertisement/ad-config.js'
import channelService from '../../../../services/2/channel.js'
import { cloneDeep } from 'lodash'
const model = {
  visible: false,
  previewImage: '',
  fileList: [],
  key: 0,
  detail: {},
  displayStrategy: 1,
  help: {
    validateStatus: '',
    help: '请上传1M以内的图片'
  },
  identifyNeeded: 0
}
export default {
  namespace: 'channelEdit',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    showModal(state, { payload: { previewImage } }) {
      const visible = true
      return { ...state, visible, previewImage }
    },
    hideModal(state) {
      const visible = false
      const key = state.key + 1
      return { ...state, visible, key }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *update({ payload }, { call, put }) {
      const { data, id, history } = payload
      const result = yield call(channelService.update, id, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { data, history } = payload
      const result = yield call(channelService.add, payload.data)
      if(result.status == 'OK') {
        message.success('添加成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(channelService.detail, id)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { detail: result.data } })
      } else {
        message.error(result.message)
      }
    }
  }
}
