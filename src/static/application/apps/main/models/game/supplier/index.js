import { message } from 'antd'
import supplierService from '../../../services/game/supplier.js'
import { cloneDeep, maxBy, merge } from 'lodash'
import moment from 'moment'

const model = {
  data: {
    objects: [],
    pagination: {},
  },
  detail: {},
  allSuppliers: [],
}

export default {
  namespace: 'supplier',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      model.allSuppliers = state.allSuppliers      
      return model
    }
  },
  effects: {
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(supplierService.list, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *allSuppliers({ payload }, { call, put }) {
      const result = yield call(supplierService.list)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { allSuppliers: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload: { id } }, { call, put }) {
        const result = yield call(supplierService.detail, id)
        if(result.status === 'OK') {
          yield put({ type: 'updateData', payload: { detail: result.data } })
        } else {
          message.error(result.message)
        }
    },
    *update({ payload }, { call, put }) {
        const { data, id, history } = payload
        const result = yield call(supplierService.update, id, data)
        if(result.status == 'OK') {
          message.success('更新成功')
          history.goBack()
        } else {
          message.error(result.message)
        }
    },
    *add({ payload }, { call, put }) {
        const { data, history } = payload
        const result = yield call(supplierService.add, payload.data)
        if(result.status == 'OK') {
          message.success('添加成功')
          history.goBack()
        } else {
          message.error(result.message)
        }
    },
  }
}
