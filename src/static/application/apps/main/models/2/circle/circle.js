import { message } from 'antd'
import circleService from '../../../services/2/circle.js'
import addressService from '../../../services/platform/address.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {
    objects: []
  },
  provinceData: [],
  clonedProvinceData: [],
  summary: null,
  disabled: false
}
export default {
  namespace: 'circle',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      model.provinceData = state.provinceData
      model.summary = state.summary
      model.clonedProvinceData = state.clonedProvinceData
      return model
    }
  },
  effects: {
    *list({ payload }, { call, put, select }) {
      const result = yield call(circleService.list, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
      const circle = yield select(state => state.circle)
      if( !circle.provinceData.length ) {
        const province = yield call(addressService.provinceList)
        if(province.status == 'OK') {
          yield put({ type: 'updateData', payload: { provinceData: province.data.objects } })
          yield put({ type: 'updateData', payload: { clonedProvinceData: province.data.objects } })
        } else {
          province.message && message.error(province.message)
        }
      }
      if( !circle.summary ) {
        const summary = yield call(circleService.summary)
        if(summary.status == 'OK') {
          yield put({ type: 'updateData', payload: { summary: summary.data } })
        } else {
          summary.message && message.error(summary.message)
        }
      }
    }
  }
}
