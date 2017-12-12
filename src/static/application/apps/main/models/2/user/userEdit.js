import { message } from 'antd'
import userService from '../../../services/2/user.js'
import addressService from '../../../services/soda-manager/address.js'
import { cloneDeep } from 'lodash'

const model = {
  visible: false,
  previewImage: '',
  fileList: [],
  key: 0,
  disabled: false,
  detail: {},
  schoolData: [],
  help: {
    validateStatus: '',
    help: '请上传1M以内,650*650的图片'
  }
}

export default {
  namespace: 'userEdit',
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
      const result = yield call(userService.update, id, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { data, history } = payload
      const result = yield call(userService.add, payload.data)
      if(result.status == 'OK') {
        message.success('添加成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *schoolList({ payload }, { call, put }) {
      const result = yield call(addressService.schoolList, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { schoolData: result.data.objects } })
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload: { id } }, { call, put }) {
      const result = yield call(userService.detail, id)
      if(result.status == 'OK') {
        // const image = result.data.avatorUrl.split('/')
        result.data.schoolId = String(result.data.schoolId)
        yield put({
          type: 'schoolList',
          payload: {
            data: {
              name: result.data.schoolName
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
              image: result.data.avatorUrl,
              url: result.data.avatorUrl,
              uid: -1,
              status: 'done',
              percent: 100,
            }],
            detail: result.data
          }
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
