import { message } from 'antd'
import cityService from '../../../services/2/city.js'
import addressService from '../../../services/soda-manager/address.js'
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
  namespace: 'twoCity',
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
      const result = yield call(cityService.list, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *provinceList({ payload }, { call, put, select }) {
      const province = yield call(addressService.provinceList)
      if(province.status == 'OK') {
        yield put({ type: 'updateData', payload: { provinceData: province.data.objects } })
        yield put({ type: 'updateData', payload: { clonedProvinceData: province.data.objects } })
      } else {
        province.message && message.error(province.message)
      }
    }
    ,
    *summary({ payload }, { call, put, select }) {
      const summary = yield call(cityService.summary)
      if(summary.status == 'OK') {
        yield put({ type: 'updateData', payload: { summary: summary.data } })
      } else {
        summary.message && message.error(summary.message)
      }
    }
  }
}
