import { message } from 'antd';
import { cloneDeep } from 'lodash';
import walletService from '../../../services/soda/wallet.js';

const model = {
  data: {
    objects: []
  }
}

export default {
  namespace: 'walletlog',
  state: cloneDeep(model),
  reducers: {
    showModal(state, { payload: { data } }) {
      return { ...state, data }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      try {
        const result = yield call(walletService.walletlogList, payload.data)
        if(result.status == 'OK') {
          yield put({ type: 'showModal', payload: { data: result.data } })
        } else {
          message.error(result.message)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
}
