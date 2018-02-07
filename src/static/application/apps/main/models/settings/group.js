import { message } from 'antd'
import menuService from '../../services/soda-manager/menu.js'
import permissionService from '../../services/soda-manager/permission.js'
import { cloneDeep } from 'lodash'
import { arrayToTree } from '../../utils/'
import { groupBy } from 'lodash'
import dict from '../../utils/dict'

const model = {
  menuPermissionData: [],
  checkAll: false,
  indeterminate: true,
  element: [],
  menu: [],
  api: [],
  allPermission: [],
  checkedList: [],
  defaultMenuPermissionData: [],
  defaultCheckedList: [],
}

export default {
  namespace: 'group',
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
    *permissionByMenuId({ payload }, { call, put }) {
      const result = yield call(permissionService.adminMenuPermission, payload.data)
      if( result.status == 'OK') {
        const defaultCheckedList = result.data.map(value => value.permissionId)

        yield put({
          type: 'updateData',
          payload: {
            defaultMenuPermissionData: result.data,
            checkedList: defaultCheckedList,
            defaultCheckedList
          }
        })
      } else {
        result.message && message.error(result.message)
      }
    },
    *updatePermission({ payload }, { call, put }) {
      const result = yield call(permissionService.updatePermission, payload.data)
      if( result.status == 'OK') {
        yield put({
          type: 'updateData',
          payload: data
        })
        message.success("更新成功")
      } else {
        result.message && message.error(result.message)
      }
    },
    *permissionList({ payload }, { call, put }) {
      const result = yield call(permissionService.list, payload.data)
      if( result.status == 'OK') {
        const group = _.groupBy( result.data.objects, 'type')
        const data = {
            element: group[dict.permission.type.element],
            menu:  group[dict.permission.type.menu],
            api:  group[dict.permission.type.api],
            allPermission:  result.data.objects
        }
        yield put({
          type: 'updateData',
          payload: data
        })
      } else {
        result.message && message.error(result.message)
      }
    },
    *menuPermission({ payload }, { call, put }) {
      const menu = yield call(menuService.list)
      const menuPermission = yield call(permissionService.adminMenuPermission)
      const allPermission = yield call(permissionService.list,{ noPagination: true })
      if(menu.status == 'OK' && menuPermission.status == 'OK' && allPermission.status == 'OK') {
        const data = menu.data.objects
        const permission = allPermission.data.objects
        const permissionGroup = _.groupBy(menuPermission.data, 'menuId')
        // 未分组权限
        const unAssignedPermission = permission.filter(item => !menuPermission.data.some(other => item.id === other.permissionId))

        data.map(value => {
          if( permissionGroup[value.id]) {
            value.permission = permissionGroup[value.id].map(item =>  item.permission)
          } else {
            value.permission = []
          }
        })
        data.unshift({
          id: -1,
          name: '未分组权限',
          permission: unAssignedPermission
        })
        yield put({ type: 'updateData', payload: { menuPermissionData: arrayToTree(data)} })
      } else {
        message.error(menu.message)
      }
    },
    *syncPermission ({ payload }, { call, put }) {
      const result = yield call(permissionService.syncPermission)
      if(result.status == 'OK') {
        message.success('权限同步成功')
      } else {
        message.error(result.message)
      }
    }
  }
}
