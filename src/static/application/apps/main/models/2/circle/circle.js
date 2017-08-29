import { message } from 'antd'
import circleService from '../../../services/2/circle.js'
import regionService from '../../../services/common/region.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {
    objects: []
  },
  initSearch: '',
  provinceData: [],
  summary: null
}
export default {
  namespace: 'circle',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload: { data } }) {
      return { ...state, data }
    },
    updateProvinceData(state, { payload: { provinceData } }) {
      return { ...state, provinceData }
    },
    updateSummary(state, { payload: { summary } }) {
      return { ...state, summary }
    },
    clear(state) {
      model.provinceData = state.provinceData
      model.summary = state.summary
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
        const province = yield call(regionService.province)
        if(province.status == 'OK') {
          yield put({ type: 'updateProvinceData', payload: { provinceData: province.data } })
        } else {
          province.message && message.error(province.message)
        }
      }
      if( !circle.summary ) {
        const summary = yield call(circleService.summary)
        if(summary.status == 'OK') {
          yield put({ type: 'updateSummary', payload: { summary: summary.data } })
        } else {
          summary.message && message.error(summary.message)
        }
      }
    }
  }
}
