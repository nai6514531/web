import { message } from 'antd'
import roleService from '../../services/settings/role.js'
import permissionService from '../../services/settings/permission.js'
export default {
  namespace: 'role',
  state: {
    key: 1,
    visible: false,
    permissionVisible: false,
    data: [],
    permissonData: {
      objects: []
    },
    currentPermisson: [],
    currentId: '',
    record: {}
  },
  reducers: {
    showModal(state, { payload: { data } }) {
      const record = data
      const visible = true
      return { ...state, visible, record }
    },
    showPermissionsModal(state, { payload: { data, id } }) {
      const currentPermisson = data
      const permissionVisible = true
      const currentId = id
      return { ...state, permissionVisible, currentPermisson, currentId }
    },
    hideModal(state) {
      const visible = false
      const permissionVisible = false
      const key = state.key + 1
      return { ...state, visible, permissionVisible, key }
    },
    updateData(state, { payload: { data } }) {
      return { ...state, data }
    },
    updatePermissonData(state, { payload: { data } }) {
      const permissonData = data
      return { ...state, permissonData }
    },
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(roleService.list)
      const permissionData = yield call(permissionService.list)
      if(result.status == 'OK' && permissionData.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
        yield put({ type: 'updatePermissonData', payload: { data: permissionData.data } })
      } else {
        message.error('调用接口出错')
      }
    },
    *update({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(roleService.update, data, id)
      if(result.status == 'OK') {
        yield put({ type: 'list' })
        yield put({ type: 'hideModal' })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const result = yield call(roleService.add, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'list' })
        yield put({ type: 'hideModal' })
        message.success('添加成功')
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload }, { call, put }) {
      const result = yield call(roleService.delete, payload.id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({ type: 'list' })
      } else {
        message.error(result.message)
      }
    },
    *permissions({ payload }, { call, put }) {
      const { id } = payload
      const result = yield call(roleService.permissions, id)
      if(result.status == 'OK') {
        yield put({
          type: 'showPermissionsModal',
          payload: {
            data: result.data,
            id : id
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *updatePermissions({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(roleService.updatePermissions, data, id)
      if(result.status == 'OK') {
        message.success('更新成功')
        yield put({
          type: 'hideModal',
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
