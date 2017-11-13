import { message } from 'antd'
import operatorService from '../../../../services/crm/search/operator.js'
import deviceService from '../../../../services/crm/device.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  }
}

export default {
  namespace: 'crmOperator',
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
      const result = yield call(operatorService.list, data)
      if(result.status == 'OK') {
        let showError = true
        yield* result.data.objects.map(function* (value, index) {
          const deviceInfo = yield call(deviceService.list, { userId: value.id })

          if(deviceInfo.status == 'OK') {
            result.data.objects[index].deviceCount = deviceInfo.data.pagination.total
          } else {
            showError && message.error(deviceInfo.message)
            showError = false
          }

        })

        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    }
  }
}
