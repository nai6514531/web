import { message } from 'antd'
import userService from '../../../services/2/user.js'
import channelService from '../../../services/2/channel.js'
import cityService from '../../../services/2/city.js'
import { cloneDeep } from 'lodash'

const model = {
  visible: false,
  previewImage: '',
  fileList: [],
  key: 0,
  disabled: false,
  showTitile: false,
  showPrice: false,
  detail: {},
  userData: [],
  channelData: [],
  help: {
    validateStatus: '',
    help: '请上传1M以内的图片'
  }
}

export default {
  namespace: 'topicEdit',
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
    *update({ payload }, { call, put }) {
      const { data, id, history } = payload
      const result = yield call(cityService.topicUpdate, id, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { data, history } = payload
      const result = yield call(cityService.topicAdd, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *userList({ payload }, { call, put }) {
      const result = yield call(userService.list, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { userData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *channelList({ payload }, { call, put, select }) {
      const result = yield call(channelService.list, payload.data)
      if(result.status == 'OK') {
        if(payload.data.from === 'detail') {
          let type
          const detail = yield select(state => state.topicEdit.detail)
          const channelId  = detail.channelId
          if(channelId != 0) {
            type = result.data.objects.filter(obj => obj.id == channelId)[0].type
          }
          if(channelId == 0 || type == 0) {
            yield put({
              type: 'updateData',
              payload: {
                showTitile: true,
                showPrice: true
              }
            })
          } else {
            yield put({
              type: 'updateData',
              payload: {
                showTitile: false,
                showPrice: false
              }
            })
          }
        }
        yield put({ type: 'updateData', payload: { channelData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(cityService.topicDetail, id)
      if(result.status == 'OK') {
        const { status, images } = result.data
        if(status === 0 || status === 1 || status === 2) {
          result.data.status = 0
        }
        if(status === 3 || status === 4) {
          result.data.status = 3
        }
        const fileList = JSON.parse(result.data.images || '[]').map((value, index) => {
          const image = value.url.split('/')
          return {
            image: image[image.length - 1],
            name: image[image.length - 1],
            url:  value.url,
            uid: index,
            status: 'done',
            percent: 100,
          }
        })
        if(fileList.length) {
          yield put({
            type: 'updateData',
            payload:  {
              help: {
                validateStatus: 'success',
                help: '图片上传成功'
              }
            }
          })
        }
        yield put({
          type: 'channelList',
          payload: {
            data: {
              pagination: false,
              from: 'detail'
            }
          }
        })
        yield put({
          type: 'userList',
          payload: {
            data: {
              mobile: result.data.user.mobile
            }
          }
        })
        yield put({
          type: 'updateData',
          payload:  {
            fileList,
            detail: result.data
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
