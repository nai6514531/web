import { message } from 'antd'
import sodaService from '../../../../services/soda/index.js'
import { cloneDeep } from 'lodash'

const dict = {
  1: [
    {
      id: 1,
      name: '充值'
    },
    {
      id: 3,
      name: '赠送现金'
    },
    {
      id: 4,
      name: '退款'
    }
  ],
  2: [
    {
      id: 2,
      name: '消费(洗衣)'
    }
  ]
}

const model = {
  data: {
    objects: []
  },
  appData: [],
  type: undefined
}

export default {
  namespace: 'sodaBonus',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    updateAppData(state, { payload: { id } }) {
      const appData = id ? dict[id] : []
      return { ...state, appData }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(sodaService.bonusBillsList, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    }
  }
}