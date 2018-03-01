import { message } from 'antd'
import userService from '../../../../../services/soda-manager/user.js'
import deviceService from '../../../../../services/soda-manager/device.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    role: [],
    parent: {

    }
  },
  key: 1,
  visible: false,
}

export default {
  namespace: 'mngUserDetail',
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
      return model
    }
  },
  effects: {
    *detail({ payload: { data } }, { call, put }) {
      const result = yield call(userService.detail, data)
      if(result.status == 'OK') {
        const deviceInfo = yield call(deviceService.list, { userId: result.data.id })
        const accountInfo = yield call(userService.cashAccount, { userId: result.data.id })

        if(deviceInfo.status == 'OK') {
          result.data.deviceCount = deviceInfo.data.pagination.total
        } else {
          message.error(deviceInfo.message)
        }

        if(accountInfo.status == 'OK') {
          result.data.autoSettle = accountInfo.data.mode.value == 0 ? '是' : '否'
          result.data.payment = accountInfo.data.type.description
          if(accountInfo.data.type.value === 1) {
            result.data.cashAccount = accountInfo.data.user.name + ' | ' + accountInfo.data.user.account
          } else {
            result.data.cashAccount = accountInfo.data.user.name
          }
        } else {
          message.error(accountInfo.message)
        }

        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *updatePassword({ payload: { data: { id, password } }}, { call, put }) {
      const result = yield call(userService.updatePassword, id, { password })
      if(result.status == 'OK') {
        message.success('密码修改成功')
        yield put({ type: 'hideModal' })
      } else {
        message.error(result.message)
      }
    },
  }
}
