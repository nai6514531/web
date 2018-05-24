import { message } from 'antd'
import { cloneDeep } from 'lodash'
import op from 'object-path'

import sodaService from '../../../../services/soda/index.js'
import dict from '../../../../utils/dict.js'
import DEVICE from '../../../../constant/device'


const model = {
  data: null,
  key: 1,
  visible: false,
}

export default {
  namespace: 'sodaUser',
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
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(sodaService.userDetail, data)
      const ticket = yield call(sodaService.ticketsList,{ customerMobile:data, limit: 1 })
      const chipcards = yield call(sodaService.chipcards, data)

      if(result.status == 'OK') {
        result.data.account.map(value => {
          // 获取微信信息
          if(value.app == 1) {
            const extra = JSON.parse(value.extra)
            result.data.openId = extra.openid
            result.data.wechatName = extra.nickname
          }
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }

      if(ticket.status == 'OK') {
        const object =  ticket.data.objects[0]
        if(object) {
          const deviceInfo = object.device
          result.data.recentAddress = deviceInfo.address
          result.data.lastTicketResume = `${DEVICE.FEATURE[object.feature] + '业务'}-${op(object).get('snapshot.modes.0.name') || '-'}-${object.serial || '-'}-${(object.value / 100).toFixed(2)}元（密码:${object.token || '-'}）`
          yield put({ type: 'updateData', payload: { data: result.data } })
        }
      } else {
        message.error(ticket.message)
      }

      if(chipcards.status == 'OK') {
        result.data.chipcardCount = chipcards.data.value
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        if(chipcards.status !== NOT_FOUND_ENTITY) {
          message.error(chipcards.message)
        }
      }
    },
    *updatePassword({ payload: { data: { mobile, password } }}, { call, put }) {
      const result = yield call(sodaService.updatePassword, mobile, { password })
      if(result.status == 'OK') {
        message.success('密码修改成功')
        yield put({ type: 'hideModal' })
      } else {
        message.error(result.message)
      }
    },
    *resetValue({ payload }, { call, put }) {
      const result = yield call(sodaService.resetWallet, payload.data )
      if(result.status == 'OK') {
        message.success('钱包清零成功')
        yield put({
          type: 'list',
          payload: {
            data: payload.data
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
