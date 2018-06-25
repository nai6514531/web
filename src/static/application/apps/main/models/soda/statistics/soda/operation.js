import { message } from 'antd'
import sodaStatisticsService from '../../../../services/soda/statistics.js'
import mngStatisticsService from '../../../../services/soda-manager/statistic.js'
import sodaService from '../../../../services/soda/index.js'
import { cloneDeep } from 'lodash'
import { transformUrl } from '../../../../utils/'
import _ from 'lodash'

const model = {
  data: {
    objects: []
  },
  type: '-1'
}
export default {
  namespace: 'operationStatistics',
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
    *listByMonth({ payload: { type, data } }, { call, put }) {
      const result = yield call(mngStatisticsService.operationlistByMonth, data)
      if(result.status == 'OK') {
        let total = {}
        result.data.objects.map((value, index) => {
          for ( let key in value ) {
            if(typeof value[key] === 'number') {
              total[key] = ( total[key] || 0 ) + value[key]
            }
          }
        })
        result.data.objects.unshift(total)
        result.data.objects.map((value, index) => value.key = index)
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *listByDay({ payload: { data } }, { call, put }) {
      const result = yield call(mngStatisticsService.operationlistByDay, data)
      if(result.status == 'OK') {
        result.data.objects.map((value, index) => {
          value.key = index + 1
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    }
  }
}
