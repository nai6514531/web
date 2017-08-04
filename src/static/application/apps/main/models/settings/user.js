import { message } from 'antd'
import userService from '../../services/settings/user.js'
import roleService from '../../services/settings/role.js'
import { storage, session } from '../../utils/storage.js'
export default {
  namespace: 'user',
  state: {
    key: 1,
    visible: false,
    data: {
      objects: []
    },
    roleData: [],
    currentRole: []
  },
  reducers: {
    showModal(state, { payload: { data } }) {
      const currentRole = data
      const visible = true
      return { ...state, visible, currentRole }
    },
    hideModal(state) {
      const visible = false
      const key = state.key + 1
      return { ...state, visible, key }
    },
    updateData(state, { payload: { data } }) {
      return { ...state, data }
    },
    updateRoleData(state, { payload: { data } }) {
      const roleData = data
      return { ...state, roleData }
    },
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(userService.list, payload.data)
      const roleData = yield call(roleService.list)
      if(result.status == 'OK' && roleData.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
        yield put({ type: 'updateRoleData', payload: { data: roleData.data } })
      } else {
        message.error('请求接口出错！')
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
    *roles({ payload }, { call, put }) {
      const { id } = payload
      const result = yield call(userService.roles, id)
      if(result.status == 'OK') {
        yield put({
          type: 'showModal',
          payload: {
            data: result.data
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *updateRoles({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(userService.updateRoles, data, id)
      if(result.status == 'OK') {
        message.success('更新成功')
        yield put({
          type: 'hideModal',
        })
      } else {
        message.error(result.message)
      }
    },
    *reset({ payload }, { call, put }) {
      const result = yield call(userService.reset, payload.data)
      if(result.status == 'OK') {
        message.success('重置密码成功')
        storage.clear('token')
        session.clear()
        payload.history.push('/')
      } else {
        message.error(result.message)
      }
    },
  }
}
