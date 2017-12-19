import { message } from 'antd'
import channelService from '../../../services/2/channel.js'
import cityService from '../../../services/2/city.js'
import commonService from '../../../services/2/common.js'
import { cloneDeep, maxBy, merge } from 'lodash'
import moment from 'moment'

const model = {
  data: {
    objects: []
  },
  detail: {},
  visible: false,
  key: 0,
  previewImage: '',
  updatedTime: ''
}

export default {
  namespace: 'channel',
  state: cloneDeep(model),
  reducers: {
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    showModal(state, { payload: { previewImage } }) {
      const visible = true
      return { ...state, visible, previewImage }
    },
    hideModal(state) {
      const visible = false
      const key = state.key + 1
      return { ...state, visible, key }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload: { data } }, { call, put }) {
      const result = yield call(channelService.list, data)
      let idList = []
      result.data.objects.map((value, index) => {
        idList.push(value.id)
      })
      const topicCount = yield call(commonService.topicCount, idList)
      if(result.status == 'OK' && topicCount.status == 'OK') {
        if(!data) {
          result.data.objects.map((value) => {
            value.updatedTime = moment(value.updatedAt)
          })
          const maxObj = maxBy(result.data.objects,'updatedTime')
          yield put({ type: 'updateData', payload: { updatedTime: maxObj.updatedAt } })
        }
        result.data.objects = merge(result.data.objects, topicCount.data)
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(channelService.detail, id)
      const topicCount = yield call(commonService.topicCount, [Number(id)])
      const inboxConsultation = yield call(commonService.inboxConsultation, { channelId: id })
      if(result.status == 'OK' && inboxConsultation.status == 'OK' && topicCount.status == 'OK') {
        result.data.consultation = inboxConsultation.data
        for(let key in topicCount.data[0]) {
          result.data[key] = topicCount.data[0][key]
        }
        yield put({ type: 'updateData', payload: { detail: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { history, data, id } = payload
      const result = yield call(channelService.update, id, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { history, data } = payload
      const result = yield call(channelService.add, data)
      if(result.status == 'OK') {
        message.success('添加成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *upDateChannelStatus({ payload }, { call, put }) {
      const { id, data, url } = payload
      const result = yield call(channelService.upDateChannelStatus, id, data)
      if(result.status == 'OK') {
        message.success('操作成功')
        yield put({
          type: 'list',
          payload: {
            data: url
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *order({ payload }, { call, put }) {
      const result = yield call(channelService.order, payload.data)
      if(result.status == 'OK') {
        message.success('同步成功')
        yield put({
          type: 'list',
          payload: {
            data: {
              status: 0,
              pagination: false
            }
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
