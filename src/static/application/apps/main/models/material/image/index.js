import { message } from 'antd'
import imageService from '../../../services/material/image.js'
import { cloneDeep } from 'lodash'

const model = {
  key: 1,
  visible: false,
  record: {},
  data: {
    objects: []
  },
  previewVisible: false,
  previewImage: '',
  fileList: [],
  help: {
    validateStatus: '',
    help: '请上传5M以内的图片'
  }
}

export default {
  namespace: 'image',
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
    *list({ payload }, { call, put }) {
      const result = yield call(imageService.list, payload.data)
      if(result.status == 'OK') {
        result.data.objects.forEach(obj => {
          obj.copiedValue = obj.url
        })
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload: { data, id, search } }, { call, put }) {
      const result = yield call(imageService.update, id, data)
      if(result.status == 'OK') {
        yield put({
          type: 'list',
          payload: {
            data: search
          }
        })
        yield put({
          type: 'updateData',
          payload: {
            visible: false
          }
        })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
    *add({ payload: { data, search } }, { call, put }) {
      const result = yield call(imageService.add, data)
      if(result.status == 'OK') {
        yield put({
          type: 'list',
          payload: {
            data: search
          }
        })
        yield put({
          type: 'updateData',
          payload: {
            visible: false
          }
        })
        message.success('添加成功')
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload: { id, search } }, { call, put }) {
      const result = yield call(imageService.delete, id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({
          type: 'list',
          payload: {
            data: search
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
