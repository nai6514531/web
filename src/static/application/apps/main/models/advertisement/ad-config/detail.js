import { message } from 'antd'
import adService from '../../../services/soda-manager/ad.js'
import applicationService from '../../../services/soda-manager/application.js'
import { cloneDeep } from 'lodash'

const model = {
  appData: [],
  postionData: [],
  visible: false,
  previewImage: '',
  fileList: [],
  key: 0,
  detail: {},
  displayStrategy: 1,
  help: {
    validateStatus: '',
    help: '请上传1M以内的图片'
  },
  identifyNeeded: 0
}

export default {
  namespace: 'adConfigDetail',
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
    deleteLocation(state) {
      delete state.detail.adPositionId
      return { ...state }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *appList({ payload }, { call, put }) {
      const result = yield call(applicationService.list)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { appData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *postionList({ payload={} }, { call, put }) {
      const result = yield call(adService.adPositionList, payload.data)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { postionData: result.data.objects } })
        let help = ''
        let identifyNeeded = 0
        if(payload.data && payload.data.adPositionId) {
          result.data.objects.map((item) => {
            if(payload.data.adPositionId == item.adPositionId) {
              help = item.standard,
              identifyNeeded = item.identifyNeeded
            }
          })
        }
        yield put({
          type: 'updateData',
          payload: {
            help: {
              validateStatus: '',
              help: help
            },
            identifyNeeded: identifyNeeded
          }
        })

      } else {
        message.error(result.message)
      }
    },
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(adService.adDetail, id)
      if(result.status == 'OK') {
        const image = result.data.imageUrl.split('/')
        yield put({
          type: 'postionList',
          payload: {
            data: {
              appId: result.data.appId,
              adPositionId: result.data.adPositionId
            }
          }
        })
        yield put({
          type: 'updateData',
          payload:  {
            help: {
              validateStatus: 'success',
              help: '图片上传成功'
            },
            fileList: [{
              image: image[image.length - 1],
              url: result.data.imageUrl,
              uid: -1,
              status: 'done',
              percent: 100,
            }],
            detail: result.data,
            displayStrategy: result.data.displayStrategy
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { data, id, history } = payload
      const result = yield call(adService.adUpdate, id, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { data, history } = payload
      const result = yield call(adService.adAdd, payload.data)
      if(result.status == 'OK') {
        message.success('添加成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    }
  }
}
