import { message } from 'antd'
import adConfigService from '../../../services/advertisement/ad-config.js'
import applicationService from '../../../services/platform/application.js'
import adPositionService from '../../../services/advertisement/ad-position.js'
import { cloneDeep } from 'lodash'
const model = {
  appData: [],
  postionData: [],
  visible: false,
  previewImage: '',
  fileList: [],
  key: 0,
  detail: {},
  displayStrategy: '0',
  help: {
    validateStatus: '',
    help: '请上传1M以内的图片'
  }
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
      delete state.detail.locationId
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
      const result = yield call(adPositionService.list, payload.data)
      if(result.status === 'OK') {
        yield put({ type: 'updateData', payload: { postionData: result.data.objects } })
        let help = ''
        if(payload.data && payload.data.locationId) {
          result.data.objects.map((item) => {
            if(payload.data.locationId == item.id) {
              help = item.standard
            }
          })
        }
        yield put({
          type: 'updateData',
          payload: {
            help: {
              validateStatus: '',
              help: help
            }
          }
        })

      } else {
        message.error(result.message)
      }
    },
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(adConfigService.detail, id)
      if(result.status == 'OK') {
        const image = result.data.image.split('/')
        yield put({
          type: 'postionList',
          payload: {
            data: {
              app_id: result.data.appId,
              locationId: result.data.locationId
            }
          }
        })
        yield put({
          type: 'updateData',
          payload:  {
            help: {
              validateStatus: 'success',
              help: '图片上传成功'
            }
          }
        })
        yield put({
          type: 'updateData',
          payload: {
            fileList: [{
              image: image[image.length - 1],
              url: result.data.image,
              uid: -1,
              status: 'done',
              percent: 100,
            }]
          }
        })
        yield put({ type: 'updateData', payload: { detail: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { data, id, history } = payload
      const result = yield call(adConfigService.update, id, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { data, history } = payload
      const result = yield call(adConfigService.add, payload.data)
      if(result.status == 'OK') {
        message.success('添加成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *upload({ payload }, { call, put }) {
      const result = yield call(adConfigService.upload, payload.data)
      if(result.status == 'OK') {
        message.success('上传成功')
      } else {
        message.error(result.message)
      }
    },
  }
}
