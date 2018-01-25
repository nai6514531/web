import { message } from 'antd'
import userService from '../../../services/soda-manager/user.js'
import deviceService from '../../../services/soda-manager/device.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    referenceDevice: {},
    status: {},
    owner: {},
    fromUser: {}
  },
  token: ''
}

export default {
  namespace: 'crmDeviceDetail',
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
      const result = yield call(deviceService.detail, data.deviceSerial)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *resetToken({ payload: { data } }, { call, put }) {
      const result = yield call(deviceService.resetToken, data.serialNumber)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { token: result.data } })
        message.success('重置成功')
      } else {
        message.error(result.message)
      }
    }
  }
}
