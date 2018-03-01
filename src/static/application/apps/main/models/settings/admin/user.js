import { message } from 'antd'
import userService from '../../../services/soda-manager/user.js'
import roleService from '../../../services/soda-manager/role.js'
import commonService from '../../../services/common.js'
import { storage, session } from '../../../utils/storage.js'
import { cloneDeep } from 'lodash'

const model = {
  key: 1,
  visible: false,
  data: {
    objects: []
  },
  roleData: [],
  currentRole: [],
}

export default {
  namespace: 'adminUser',
  state: cloneDeep(model),
  reducers: {
    showModal(state, { payload: { data } }) {
      // 单角色
      const currentRole = data[0]
      const visible = true
      return { ...state, visible, currentRole }
    },
    hideModal(state) {
      const visible = false
      const key = state.key + 1
      return { ...state, visible, key }
    },
    updateData(state, { payload }) {
      return { ...state, ...payload }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(userService.adminUserlist, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload }, { call, put }) {
      const result = yield call(userService.detail, payload.id)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { history, data, id } = payload
      const result = yield call(userService.update, data, id)
      if(result.status == 'OK') {
        history.goBack()
        message.success('更新成功')
        yield put({ type: 'common/info' })
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const result = yield call(userService.add, payload.data)
      if(result.status == 'OK') {
        payload.history.goBack()
        message.success('添加成功')
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(userService.delete, id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({
          type: 'list',
          payload: {
            data: data
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *reset({ payload }, { call, put }) {
      const result = yield call(commonService.reset, payload.data)
      if(result.status == 'OK') {
        message.success('重置密码成功')
        // storage.clear('token')
        // session.clear()
        // payload.history.push('/')
      } else {
        message.error(result.message)
      }
    }
  }
}
