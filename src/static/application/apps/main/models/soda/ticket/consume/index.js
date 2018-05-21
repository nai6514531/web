import { message } from 'antd'
import { cloneDeep } from 'lodash'
import _ from 'lodash'

import ticketService from '../../../../services/soda/ticket.js'
import userService from '../../../../services/soda-manager/user.js'
import DEVICE from '../../../../constant/device'

const model = {
  data: {
    objects: []
  },
  visible: false,
  key: 0,
  exportUrl: '',
  date: new Date()
}

export default {
  namespace: 'consume',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    showModal(state) {
      const visible = true
      return { ...state, visible }
    },
    hideModal(state) {
      const visible = false
      const key = state.key + 1
      return { ...state, visible, key }
    },
    clear(state) {
      model.appData = state.appData
      model.postionData = state.postionData
      return model
    }
  },
  effects: {
    *list({ payload: { data } }, { call, put }) {
      let result
      let { type } = data
      data = _.omit(data,  ['type'])
      if (type === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER) {
        result = yield call(ticketService.drinkingTicketsList, data)
      } else {
        result = yield call(ticketService.ticketsList, data)
      }
      
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *export({ payload: { data } }, { call, put }) {
      let result
      let { type } = data
      data = _.omit(data,  ['type'])
      if (type === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER) {
        result = yield call(ticketService.drinkingExport, data)
      } else {
        result = yield call(ticketService.export, data)
      }
      if(result.status == 'OK') {
        yield put({ type: 'showModal' })
        yield put({ type: 'updateData', payload: { exportUrl: result.data.url } })
      } else {
        message.error(result.message)
      }
    },
    *refund({ payload: { id, type, data } }, { call, put }) {
      let result
      if (type === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER) {
        result = yield call(ticketService.drinkingRefund, id)
      } else {
        result = yield call(ticketService.refund, id)
      }
      if(result.status == 'OK') {
        message.success('退款成功')
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
