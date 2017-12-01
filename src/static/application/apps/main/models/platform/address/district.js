import { message } from 'antd'
import addressService from '../../../services/soda-manager/address.js'
import { cloneDeep } from 'lodash'

const model = {
  key: 1,
  visible: false,
  record: {},
  data: {
    objects: []
  },
  provinceData: [],
  cityData: [],
  cityDetailData: []
}

export default {
  namespace: 'district',
  state: cloneDeep(model),
  reducers: {
    showModal(state, { payload: { data } }) {
      const record = data
      const visible = true
      return { ...state, visible, record }
    },
    hideModal(state) {
      const visible = false
      const key = state.key + 1
      return { ...state, visible, key }
    },
    updateData(state, { payload } ) {
      return { ...state, ...payload }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(addressService.districtList, payload.data)
      if(result.status == 'OK') {
        result.data.objects.map(value => {
          value.id = String(value.id || '')
          value.provinceId = String(value.provinceId || '')
          value.cityId = String(value.cityId || '')
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *provinceList({ payload }, { call, put }) {
      const result = yield call(addressService.provinceList, {}, true)
      if(result.status == 'OK') {
        result.data.objects.map(value => {
          value.id = String(value.id || '')
        })
        yield put({ type: 'updateData', payload: { provinceData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *cityList({ payload }, { call, put }) {
      const result = yield call(addressService.cityList, payload.data, true)
      if(result.status == 'OK') {
        result.data.objects.map(value => {
          value.id = String(value.id || '')
        })
        yield put({ type: 'updateData', payload: { [payload.attr]: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(addressService.districtUpdate, id, data)
      if(result.status == 'OK') {
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
        yield put({ type: 'hideModal' })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const result = yield call(addressService.districtAdd, payload.data)
      if(result.status == 'OK') {
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
        yield put({ type: 'hideModal' })
        message.success('添加成功')
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload }, { call, put }) {
      const result = yield call(addressService.districtDelete, payload.id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
