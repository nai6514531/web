import { message } from 'antd'
import permissionService from '../../services/settings/permission'
import menuService from '../../services/settings/menu.js'
import actionService from '../../services/settings/action.js'
import elementService from '../../services/settings/element.js'
import { cloneDeep } from 'lodash'
const model = {
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
  cachedActionData: [],
  menuData: [],
  elementData: []
}
export default {
  namespace: 'permission',
  state: cloneDeep(model),
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
    updateData(state, { payload: { data, menuData, cachedActionData, elementData } }) {
      return { ...state, data, menuData, cachedActionData, elementData }
    },
    updateActionData(state, { payload }) {
      const actionData = payload ? payload.actionData : state.cachedActionData
      return { ...state, actionData }
    },
    clear(state) {
      return model
    }
  },
  effects: {
    *list({ payload }, { call, put }) {
      const result = yield call(permissionService.list, payload.data)
      const menuData = yield call(menuService.list)
      const actionData = yield call(actionService.list)
      const elementData = yield call(elementService.list)
      if(result.status === 'OK' && menuData.status === 'OK' && actionData.status === 'OK' && elementData.status === 'OK' ) {
        yield put({
          type: 'updateData',
          payload: {
            data: result.data,
            menuData: menuData.data.objects,
            cachedActionData: actionData.data.objects,
            elementData: elementData.data.objects
          }
        })
      } else {
        result.message && message.error(result.message)
        menuData.message && message.error(menuData.message)
        actionData.message && message.error(actionData.message)
        elementData.message && message.error(elementData.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { data, id, url } = payload
      const result = yield call(permissionService.update, data, id)
      if(result.status == 'OK') {
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
        yield put({ type: 'hideModal' })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const result = yield call(permissionService.add, payload.data)
      if(result.status == 'OK') {
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
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
        yield put({
          type: 'list',
          payload: {
            data: payload.url
          }
        })
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
      if(result.status === 'OK') {
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
      if(result.status === 'OK') {
        yield put({
          type: 'updateActionData'
        })
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
    *searchAction({ payload }, { call, put }) {
      const { data } = payload
      const result = yield call(actionService.list, data)
      if(result.status === 'OK') {
        yield put({
          type: 'updateActionData',
          payload: {
            actionData: result.data.objects
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
        yield put({ type: 'common/info' })
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
        yield put({ type: 'common/info' })
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
        yield put({ type: 'common/info' })
        message.success('更新成功')
      } else {
        message.error(result.message)
      }
    },
  }
}
