import { message } from 'antd'
import { cloneDeep } from 'lodash'

import ticketService from '../../../../services/soda/ticket.js'
import userService from '../../../../services/soda-manager/user.js'
import authHoldService from '../../../../services/soda/auth-hold.js'
import DEVICE from '../../../../constant/device'

const model = {
  data: {
    owner: {},
    device: {},
    payment: {},
  },
  parent: {},
  authHold: {
    status: '',
  },
}

export default {
  namespace: 'consumeDetail',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      model.appData = state.appData
      model.postionData = state.postionData
      return model
    }
  },
  effects: {
    *detail({ payload: { id, type } }, { call, put }) {
      let result
      if (type === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER) {
        result = yield call(ticketService.drinkingTicketDetail, id)
      } else {
        result = yield call(ticketService.ticketDetail, id)
      }
      if(result.status == 'OK') {
        yield put({
          type: 'updateData',
          payload: {
            data: result.data
          }
        })
        let { data: { holdId } } = result
        if (holdId) {
          result  = yield call(authHoldService.status, holdId)
          if (result.status == 'OK') {
            yield put({
              type: 'updateData',
              payload: {
                authHold: {
                  status: result.data.status
                }
              }
            })
          }
        }
        if (result.data.owner.parentId) {
          const operations = yield call(userService.detail, result.data.owner.parentId)
          if (operations.status == 'OK') {
            yield put({
              type: 'updateData',
              payload: {
                parent: operations.data
              }
            })
          } else {
            message.error(operations.message)
          }
        }
       
      } else {
        message.error(result.message)
      }
    },
    *releaseStatus({ payload: { data } }, { call, put }) {
      let result = yield call(authHoldService.releaseStatus, data)
      
      if(result.status == 'OK') {
        yield put({
          type: 'updateData',
          payload: {
            authHold: {
              status: ''
            }
          }
        })
      } else {
        message.error(result.message)
      }
    },

  }
}
