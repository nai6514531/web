import { message } from 'antd'
import adConfigService from '../../../services/advertisement/ad-config.js'
import adPositionService from '../../../services/advertisement/ad-position.js'
import { cloneDeep, orderBy } from 'lodash'
const model = {
  postionData: [],
  visible: false,
  key: 0,
  previewImage: ''
}
export default {
  namespace: 'adOrder',
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
    *list({ payload: { data, order, attr } }, { call, put }) {
      const result = yield call(adConfigService.list, data, order)
      if(result.status == 'OK') {
        const orderData = orderBy(result.data.objects,'order','asc')
        yield put({ type: 'updateData', payload: { [attr]: orderData } })
      } else {
        message.error(result.message)
      }
    },
    *postionList({ payload={} }, { call, put }) {
      const result = yield call(adPositionService.list)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { postionData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *order({ payload }, { call, put }) {
      const result = yield call(adConfigService.order, payload.data)
      if(result.status == 'OK') {
        message.success('同步成功')
        // yield put({ type: 'list' })
      } else {
        message.error(result.message)
      }
    }
  }
}
