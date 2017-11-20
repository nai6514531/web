import { message } from 'antd'
import deviceService from '../../../services/soda-manager/device.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  },
  selectedRowKeys: []
}

export default {
  namespace: 'crmDevice',
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
      const result = yield call(deviceService.list, data)
      if(result.status == 'OK') {
        let showError = true
        yield* result.data.objects.map(function* (value, index) {
          const operations = yield call(deviceService.operations, {
            serialNumber: value.serialNumber,
            limit: 1,
            type: '1,4'
          })

          if(operations.status == 'OK') {
            const operatorInfo = operations.data.objects[0]
            if(operatorInfo) {
              result.data.objects[index].assigner = operatorInfo.operator.name
              result.data.objects[index].assignerMobile = operatorInfo.operator.mobile
            }
          } else {
            showError && message.error(operations.message)
            showError = false
          }

        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *status({ payload }, { call, put }) {
      const result = yield call(deviceService.status, payload.id, payload.data)
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
      const result = yield call(deviceService.reset, payload.id)
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
