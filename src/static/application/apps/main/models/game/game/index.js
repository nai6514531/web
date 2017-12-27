import { message } from 'antd'
import gameService from '../../../services/game/game.js'
import { cloneDeep, maxBy, merge } from 'lodash'
import moment from 'moment'

const model = {
  data: {
    objects: []
  },
  detail: {},
  allGames: [],
}

export default {
  namespace: 'game',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      model.allGames = state.allGames      
      return model
    }
  },
  effects: {
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(gameService.list, data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        result.message && message.error(result.message)
      }
    },
    *allGames({  payload: { data }}, { call, put }) {
      const result = yield call(gameService.list, data)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { allGames: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
  }
}
