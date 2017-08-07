import { message } from 'antd'
import permissionService from '../../services/settings/permission'
import menuService from '../../services/settings/menu.js'
import actionService from '../../services/settings/action.js'
import elementService from '../../services/settings/element.js'
export default {
  namespace: 'permission',
  state: {
    key: 1,
    visible: false,
    menuVisible: false,
    elementVisible: false,
    actionVisible: false,
    record: {},
    currentData: [],
    data: {
      objects: []
    },
    actionData: [],
    menuData: [],
    elementData: []
  },
  reducers: {
    showMenu(state, { payload: { data, id } }) {
      const currentData = data
      const menuVisible = true
      const currentId = id
      return { ...state, menuVisible, currentId, currentData }
    },
    showElement(state, { payload: { data, id } }) {
      const currentData = data
      const elementVisible = true
      const currentId = id
      return { ...state, elementVisible, currentId, currentData }
    },
    showAction(state, { payload: { data, id } }) {
      const currentData = data
      const actionVisible = true
      const currentId = id
      return { ...state, actionVisible, currentId, currentData }
    },
    showModal(state, { payload: { data } }) {
      const record = data
      const visible = true
      return { ...state, visible, record }
    },
    hideModal(state) {
      const visible = false
      const actionVisible = false
      const menuVisible = false
      const elementVisible = false
      const key = state.key + 1
      return { ...state, visible, menuVisible, elementVisible, actionVisible, key }
    },
    updateData(state, { payload: { data, menuData, actionData, elementData } }) {
      return { ...state, data, menuData, actionData, elementData }
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(permissionService.list)
      const menuData = yield call(menuService.list)
      const actionData = yield call(actionService.list)
      const elementData = yield call(elementService.list)
      if(result.status === 'OK' && menuData.status === 'OK' && actionData.status === 'OK' && elementData.status === 'OK' ) {
        yield put({
          type: 'updateData',
          payload: {
            data: result.data,
            menuData: menuData.data.objects,
            actionData: actionData.data,
            elementData: elementData.data.objects
          }
        })
      } else {
        message.error('请求接口出错！')
      }
    },
    *update({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(permissionService.update, data, id)
      if(result.status == 'OK') {
        yield put({ type: 'list' })
        yield put({ type: 'hideModal' })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const result = yield call(permissionService.add, payload.data)
      if(result.status == 'OK') {
        yield put({ type: 'list' })
        yield put({ type: 'hideModal' })
        message.success('添加成功')
      } else {
        message.error(result.message)
      }
    },
    *delete({ payload }, { call, put }) {
      const result = yield call(permissionService.delete, payload.id)
      if(result.status == 'OK') {
        message.success('删除成功')
        yield put({ type: 'list' })
      } else {
        message.error(result.message)
      }
    },
    *menu({ payload }, { call, put }) {
      const { id } = payload
      const result = yield call(permissionService.menu, id)
      if(result.status == 'OK') {
        yield put({
          type: 'showMenu',
          payload: {
            data: result.data,
            id : id
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *element({ payload }, { call, put }) {
      const { id } = payload
      const result = yield call(permissionService.element, id)
      if(result.status == 'OK') {
        yield put({
          type: 'showElement',
          payload: {
            data: result.data,
            id : id
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *action({ payload }, { call, put }) {
      const { id } = payload
      const result = yield call(permissionService.action, id)
      if(result.status == 'OK') {
        yield put({
          type: 'showAction',
          payload: {
            data: result.data,
            id : id
          }
        })
      } else {
        message.error(result.message)
      }
    },
    *updateMenu({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(permissionService.updateMenu, data, id)
      if(result.status == 'OK') {
        yield put({ type: 'hideModal' })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
    *updateElement({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(permissionService.updateElement, data, id)
      if(result.status == 'OK') {
        yield put({ type: 'hideModal' })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
    *updateAction({ payload }, { call, put }) {
      const { data, id } = payload
      const result = yield call(permissionService.updateAction, data, id)
      if(result.status == 'OK') {
        yield put({ type: 'hideModal' })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
  }
}
