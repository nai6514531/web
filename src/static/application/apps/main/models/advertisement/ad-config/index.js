import { message } from 'antd'
import adConfigService from '../../../services/advertisement/ad-config.js'
import applicationService from '../../../services/platform/application.js'
import adPositionService from '../../../services/advertisement/ad-position.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {
    objects: []
  },
  appData: [],
  postionData: [],
  visible: false,
  key: 0,
  previewImage: ''
}
export default {
  namespace: 'adConfig',
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
    deleteLocation(state) {
      delete state.detail.adPositionId
      return { ...state }
    },
    clear(state) {
      model.appData = state.appData
      model.postionData = state.postionData
      return model
    }
  },
  effects: {
    *list({ payload: { data, order } }, { call, put }) {
      const result = yield call(adConfigService.list, data, order)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *appList({ payload }, { call, put }) {
      const result = yield call(applicationService.list)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { appData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *postionList({ payload={} }, { call, put }) {
      const result = yield call(adPositionService.list, payload.data)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { postionData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload: { id, data } }, { call, put }) {
      const result = yield call(adConfigService.delete, id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({
          type: 'list',
          payload: { data }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
