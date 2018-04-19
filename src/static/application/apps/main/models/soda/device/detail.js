import { message } from 'antd'
import userService from '../../../services/soda-manager/user.js'
import deviceService from '../../../services/soda-manager/device.js'
import deviceAddressService from '../../../services/soda-manager/device-service-address.js'

import { cloneDeep } from 'lodash'

const model = {
  data: {
    referenceDevice: {},
    status: {},
    owner: {},
    fromUser: {}
  },
  deviceTypes: [],
  modes: [],
  token: ''
}

export default {
  namespace: 'sodaDeviceDetail',
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
    *detail({ payload: { data } }, { call, put }) {
      const { status, data: detail } = yield call(deviceService.detail, data.serial)
      if (status == 'OK') {
        const { data: { objects: users } }= yield call(userService.adminUserlist, { ids: [detail.user.id, detail.assignedUser.id].join(','), limit: 2, offset: 0 })
        const { data: serviceAddress } = yield call(deviceAddressService.detail, detail.serviceAddress.id)
        yield put({
          type: 'updateData',
          payload: {
            data: {
              ...detail,
              user: _.find(users, { id: detail.user.id }) || {},
              assignedUser: _.find(users, { id: detail.assignedUser.id }) || {},
              serviceAddress: serviceAddress || {}
            }
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *resetToken({ payload: { data } }, { call, put }) {
      const result = yield call(deviceService.resetToken,{
        serial:data.serial
      })
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { token: result.data } })
        message.success('重置成功')
      } else {
        message.error(result.message)
      }
    },
    *deviceTypes({ payload }, { call, put }) {
      const result = yield call(deviceService.deviceType)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { deviceTypes: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *modes({ payload }, { call, put }) {
      const result = yield call(deviceService.deviceModeList, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { modes: result.data.objects } })
      } else {
        message.error(result.message)
      }
    }
  }
}
