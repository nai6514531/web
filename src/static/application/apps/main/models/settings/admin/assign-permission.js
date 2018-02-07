import { message } from 'antd'
import menuService from '../../../services/soda-manager/menu.js'
import roleService from '../../../services/soda-manager/role.js'
import permissionService from '../../../services/soda-manager/permission.js'
import { cloneDeep, difference } from 'lodash'
import { arrayToTree } from '../../../utils/'
import { groupBy } from 'lodash'
import dict from '../../../utils/dict'

const model = {
  orignData: [], //扁平化的菜单权限对应数据，用于取消时重置页面数据
  baseData: [], //扁平化的菜单权限对应数据,对应面的操作基于这分数据
  menuPermissionData: [],//树形结构的菜单权限对应数据
  assignedPermission: [],
  defaultCheckedList: [],
}

export default {
  namespace: 'adminAssignPermissions',
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
    *getAssignedPermission({ payload: { data } }, { call, put, select }) {
         // 拉取已被分配的权限
      const result = yield call(permissionService.rolePermission, data)
      if( result.status == 'OK') {
        const data = yield select(state => state.adminAssignPermissions.orignData)
        const defaultCheckedList = result.data.map(value => value.permissionId)
        data.map(value => {
          value.checkedList = defaultCheckedList.filter(id => value.permission.some(item => item.id === id))
          value.checkAll =  value.permission.length === value.checkedList.length
        })
        yield put({
          type: 'updateData',
          payload: {
            assignedPermission: result.data,
            orignData: cloneDeep(data),
            baseData:  cloneDeep(data),
            menuPermissionData: arrayToTree(data),
            defaultCheckedList
          }
        })
      } else {
        result.message && message.error(result.message)
      }
    },
    *menuPermission({ payload }, { call, put, select }) {
      // 拉取菜单和权限的对应关系
      const menu = yield call(menuService.list)
      const menuPermission = yield call(permissionService.adminMenuPermission)
      const defaultCheckedList = yield select(state => state.adminAssignPermissions.defaultCheckedList)
      if(menu.status == 'OK' && menuPermission.status == 'OK') {
        const data = menu.data.objects
        const permissionGroup = _.groupBy(menuPermission.data, 'menuId')
        data.map(value => {
          if( permissionGroup[value.id]) {
            // 默认checkbox不可以编辑
            value.permission = permissionGroup[value.id].map(item =>  item.permission)
            value.checkedList = defaultCheckedList.filter(id => value.permission.some(item => item.id === id))
          } else {
            value.permission = []
            value.checkedList = []
          }
          value.disabled = true
          value.checkAll =  value.permission.length === value.checkedList.length
          value.indeterminate = false
        })
        yield put({
          type: 'updateData',
          payload: {
            orignData: cloneDeep(data),
            baseData:  cloneDeep(data),
            menuPermissionData: arrayToTree(data)
          }
        })
      } else {
        menu.message && message.error(menu.message)
        menuPermission.message && message.error(menuPermission.message)
      }

    },
    *cancel({ payload }, { call, put, select }) {
      const orignData = yield select(state => state.adminAssignPermissions.orignData)
      yield put({
        type: 'updateData',
        payload: {
          baseData: cloneDeep(orignData),
          menuPermissionData: arrayToTree(orignData)
        }
      })
    },
    *changeCheckedList({ payload: { data: { id, checkedList } } }, { call, put, select }) {
      const baseData = yield select(state => state.adminAssignPermissions.baseData)
      const len = baseData.length
      for( let i = 0; i < len; i++ ) {
        let item = baseData[i]
        if( item.id == id ) {
          item.checkedList = checkedList
          item.indeterminate = !!checkedList.length && (checkedList.length < item.permission.length)
          item.checkAll = checkedList.length === item.permission.length
        }
      }
      yield put({
        type: 'updateData',
        payload: {
          baseData,
          menuPermissionData: arrayToTree(baseData)
        }
      })
    },
    *changeStatus({ payload: { data: { id, disabled, checkedList } } }, { call, put, select }) {
      const baseData = yield select(state => state.adminAssignPermissions.baseData)
      const len = baseData.length
      for( let i = 0; i < len; i++ ) {
        let item = baseData[i]
        if(!item.disabled && !disabled) {
          message.error('请先取消或保存当前操作')
          return
        }
        if( item.id == id ) {
          item.disabled = disabled
        }
      }
      yield put({
        type: 'updateData',
        payload: {
          baseData: cloneDeep(baseData),
          menuPermissionData: arrayToTree(baseData)
        }
      })
    },
    *checkAll({ payload: { data: { id, indeterminate, checkAll } } }, { call, put, select }) {
     const baseData = yield select(state => state.adminAssignPermissions.baseData)
      const len = baseData.length
      for( let i = 0; i < len; i++ ) {
        let item = baseData[i]
        if( item.id == id ) {
          let allCheckedList = item.permission.map(value => value.id)
          item.checkedList = checkAll ? allCheckedList : []
          item.indeterminate = false
          item.checkAll = checkAll
        }
      }
      yield put({
        type: 'updateData',
        payload: {
          baseData: cloneDeep(baseData),
          menuPermissionData: arrayToTree(baseData)
        }
      })
    },
    *assign({ payload: { data: { id, roleId } } }, { call, put, select }) {
      const orignData = yield select(state => state.adminAssignPermissions.orignData)
      const baseData = yield select(state => state.adminAssignPermissions.baseData)
      const assignedPermission = yield select(state => state.adminAssignPermissions.assignedPermission)
      const len = baseData.length
      let [deleteList, createList] = [[], []]
      for( let i = 0; i < len; i++ ) {
        let item = baseData[i]
        if(item.id == id) {
          let checkedList = item.checkedList
          let defaultCheckedList =  orignData[i].checkedList

          difference(defaultCheckedList,checkedList).map(permissionId => {
            return assignedPermission.map(item => {
              if(permissionId == item.permissionId) {
                deleteList.push(item.id)
              }
            })
          })
          createList = difference(checkedList,defaultCheckedList).map(permissionId => {
            return {
              roleId: Number(roleId),
              permissionId
            }
          })

          const result = yield call(permissionService.assignPermission, { delete: deleteList, create: createList })
          if(result.status == 'OK') {
            yield put({
              type: 'getAssignedPermission',
              payload:  {
                data: {
                  roleId
                }
              }
            })
            message.success('更新成功')
          } else {
            result.message && message.error(result.message)
          }
          return
        }
      }
    }
  }
}
