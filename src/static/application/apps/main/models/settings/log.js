import { message } from 'antd'
import logService from '../../services/soda-manager/log'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    objects: []
  },
  detail: {},
  date: new Date()
}

export default {
  namespace: 'log',
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
    *loginList({ payload: { data } }, { call, put }) {
      const result = yield call(logService.loginList, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *actionList({ payload: { data } }, { call, put }) {
      const result = yield call(logService.actionList, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *actionDetail({ payload: {  id  } }, { call, put }) {
      const result = yield call(logService.actionDetail, id)
      if(result.status == 'OK') {
        try {
          result.data.requestBody = JSON.stringify(JSON.parse(result.data.requestBody), null, 2)
        } catch (e){

        }
        yield put({ type: 'updateData', payload: { detail: result.data } })
      } else {
        message.error(result.message)
      }
    }
  }
}
