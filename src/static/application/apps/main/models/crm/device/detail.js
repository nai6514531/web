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
  }
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
    }
  }
}
