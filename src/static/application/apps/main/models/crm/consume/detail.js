import { message } from 'antd'
import sodaService from '../../../services/soda/index.js'
import userService from '../../../services/soda-manager/user.js'
import { cloneDeep } from 'lodash'

const model = {
  data: {
    owner: {},
    device: {},
    payment: {}
  },
  parent: {}
}

export default {
  namespace: 'crmConsumeDetail',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      model.appData = state.appData
      model.postionData = state.postionData
      return model
    }
  },
  effects: {
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(sodaService.ticketDetail, id)
      if(result.status == 'OK') {
        const operations = yield call(userService.detail, result.data.owner.parentId)
        if(operations.status == 'OK') {
          yield put({
            type: 'updateData',
            payload: {
              parent: operations.data
            }
          })
        } else {
          message.error(operations.message)
        }

        yield put({
          type: 'updateData',
          payload: {
            data: result.data
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
