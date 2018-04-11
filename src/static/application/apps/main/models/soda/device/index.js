import { message } from 'antd'
import op from 'object-path'
import deviceService from '../../../services/soda-manager/device.js'
import userService from '../../../services/soda-manager/user.js'
import deviceAddressService from '../../../services/soda-manager/device-service-address.js'
import { cloneDeep } from 'lodash'
import _ from 'lodash'

const model = {
  data: {
    objects: []
  },
  detail: {
    objects: []
  },
  modes: [],
  deviceTypes: [],
  serviceAddresse: {},
  selectedRowKeys: []
}

export default {
  namespace: 'sodaDevice',
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
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(deviceService.adminlist, data)
      if(result.status == 'OK') {
        let users, addresses
        let userIds = _.chain(result.data.objects).map((device) => device.user.id).union().value()
        let addressIds = _.chain(result.data.objects).map((device) => device.serviceAddress.id).union().value()
        if (!_.isEmpty(userIds)) {
          users = yield call(userService.adminUserlist, { ids: userIds.join(',')})
        }
        if (!_.isEmpty(addressIds)) {
          addresses = yield call(deviceAddressService.list, { ids: addressIds.join(',')})
        } 
        
        const objects = _.map(result.data.objects || [], (object) => {
          return {
            ...object,
            user: _.find(op(users).get('data.objects'), { id: object.user.id }) || {},
            serviceAddress: _.find(op(addresses).get('data.objects'), { id: object.serviceAddress.id }) || {},
          }
        })
        yield put({ 
          type: 'updateData', 
          payload: { 
            data: { objects, pagination: result.data.pagination }
          } 
        })
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
    },
    *deviceTypes({ payload }, { call, put }) {
      const result = yield call(deviceService.deviceType)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { deviceTypes: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *serviceAddress({ payload }, { call, put }) {
      const result = yield call(deviceAddressService.list)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { serviceAddress: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload }, { call, put }) {
      const result = yield call(deviceService.operations, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { detail: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *lock({ payload }, { call, put }) {
      const result = yield call(deviceService.lock, {
        serials: payload.serials
      })
      if(result.status == 'OK') {
        message.success('操作成功')
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *unlock({ payload }, { call, put }) {
      const result = yield call(deviceService.unlock, {
        serials: payload.serials
      })
      if(result.status == 'OK') {
        message.success('操作成功')
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *reset({ payload }, { call, put }) {
      const result = yield call(deviceService.reset,{
        serials: payload.serials
      })
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
