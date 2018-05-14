import { message } from 'antd'
import sodaService from '../../../../services/soda/index.js'
import { cloneDeep } from 'lodash'

const model = {
    data: {
      objects: []
    },
}

export default {
    namespace: 'sodaBonus',
    state: cloneDeep(model),
    reducers: {
        updateData(state, { payload }) {
          return { ...state, ...payload }
        },
        clear(state) {
          return model
        }
    }
}