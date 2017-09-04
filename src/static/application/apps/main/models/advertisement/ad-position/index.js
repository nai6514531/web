import { message } from 'antd'
import adPositionService from '../../../services/advertisement/ad-position.js'
import applicationService from '../../../services/platform/application.js'
import { cloneDeep } from 'lodash'
const model = {
  data: {
    objects: []
  },
  detail: {},
  appData: []
}
export default {
  namespace: 'adPosition',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload}) {
      return { ...state, ...payload }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload = {} }, { call, put }) {
      const result = yield call(adPositionService.list, payload.data)
      yield put({ type: 'appList' })
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { data, id, history } = payload
      const result = yield call(adPositionService.update, id, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(adPositionService.detail, id)
      yield put({ type: 'appList' })
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { detail: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *appList({ payload }, { call, put }) {
      const result = yield call(applicationService.list)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { appData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { data, history } = payload
      const result = yield call(adPositionService.add, data)
      if(result.status == 'OK') {
        message.success('添加成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload }, { call, put }) {
      const result = yield call(adPositionService.delete, payload.id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({ type: 'list' })
      } else {
        message.error(result.message)
      }
    }
  }
}
