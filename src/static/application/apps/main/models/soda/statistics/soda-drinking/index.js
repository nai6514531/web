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
  namespace: 'drinkingBusinessStatistics',
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
    *list({ payload: { type, data } }, { call, put }) {
      const result = yield call(mngStatisticsService.drinkingListByMonth, data)
      if(result.status == 'OK') {
        let total = {}
        result.data.objects.map((value, index) => {
          value.key = index + 1
          for ( let key in value ) {
              if(typeof value[key] === 'number') {
                total[key] = ( total[key] || 0 ) + value[key]
              }
          }
          if( result.data.objects.length === index + 1 ) {
            total.key = index + 2
            result.data.objects.push(total)
          }
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *dayList({ payload: { type, data } }, { call, put }) {
      const result = yield call(mngStatisticsService.drinkingListByDay, data)
      if(result.status == 'OK') {
        result.data.objects.map((value, index) => {
          value.key = index + 1 + Number(data.offset || 0)
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }

    },
    *listByDates({ payload: { type, data } }, { call, put }) {
      const result = yield call(sodaStatisticsService.drinkingListByDates, data)
      if(result.status == 'OK') {
        result.data.objects.map((value, index) => {
          value.key = index + 1 + Number(data.offset || 0)
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *listByDevices({ payload: { type, data } }, { call, put }) {
      const result = yield call(sodaStatisticsService.drinkingListByDevices, data)
      if(result.status == 'OK') {
        result.data.objects.map((value, index) => {
          value.key = index + 1 + Number(data.offset || 0)
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *consumptionsList({ payload: { type, data } }, { call, put }) {
      const result = yield call(sodaService.drinkingTicketsList, data)
      if(result.status == 'OK') {
        result.data.objects.map((value, index) => {
          value.key = index + 1 + Number(data.offset || 0)
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
  }
}
