import { message } from 'antd'
import cityService from '../../../services/2/city.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {},
  visible: false,
  previewImage: '',
}
export default {
  namespace: 'topicDetail',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload: { data } }) {
      return { ...state, data }
    },
    showModal(state, { payload: { previewImage } }) {
      const visible = true
      return { ...state, visible, previewImage }
    },
    hideModal(state) {
      const visible = false
      // const key = state.key + 1
      return { ...state, visible }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(cityService.topicDetail, payload.id)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
    }
  }
}
