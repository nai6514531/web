import { message } from 'antd'
import statisticsService from '../../../services/business/statistics.js'
import commonService from '../../../services/common/'
import operatorService from '../../../services/crm/search/operator.js'//后续会移出去 公共的
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  },
  visible: false,
  key: 0,
  exportUrl: '',
}

export default {
  namespace: 'businessConsume',
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
      const result = yield call(commonService.consumptionsList, data)
      if(result.status == 'OK') {
        let showError = true
        yield* result.data.objects.map(function* (value, index) {
          // const operations = yield call(operatorService.detail, value.owner.parentId)
          result.data.objects[index].key = index + 1 + Number(data.offset)
          // if(operations.status == 'OK') {
          //   const operatorInfo = operations.data
          //   if(operatorInfo) {
          //     result.data.objects[index].parentOperator = operatorInfo.name
          //     result.data.objects[index].parentOperatorMobile = operatorInfo.mobile
          //   }
          // } else {
          //   showError && message.error(operations.message)
          //   showError = false
          // }

        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *export({ payload: { data } }, { call, put }) {
      const result = yield call(statisticsService.export, data)
      if(result.status == 'OK') {
        yield put({ type: 'showModal' })
        yield put({ type: 'updateData', payload: { exportUrl: result.data.url } })
      } else {
        message.error(result.message)
      }
    },
    *refund({ payload: { id, data } }, { call, put }) {
      const result = yield call(statisticsService.refund, id)
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
