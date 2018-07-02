import { message } from 'antd'
import userService from '../../../services/soda-manager/user.js'
import roleService from '../../../services/soda-manager/role.js'
import commonService from '../../../services/common.js'
import permissionService from '../../../services/soda-manager/permission.js'
import { storage, session } from '../../../utils/storage.js'
import { cloneDeep, groupBy, uniqBy, find } from 'lodash'
import { arrayToTree } from '../../../utils/'

const intToString = (data) => {
  // trasform value from int to string
  return _.map(data, (item) => {
    if(item.children) {
      intToString(item.children)
    }
    item.value = String(item.value)
    return item
  })
}
const model = {
  key: 1,
  visible: false,
  disabled: false,
  data: {
    objects: []
  },
  detail: {
  },
  filterUserData: [],
  roleData: [],
  roleTree: [],
  activeKey: '',
  currentRole: -1,
  menuPermissionData: [],//树形结构的菜单权限对应数据
  assignedPermissionList: [],
  permissionData: []
}

export default {
  namespace: 'adminUser',
  state: cloneDeep(model),
  reducers: {
    showModal(state) {
      // 单角色
      const visible = true
      return { ...state, visible }
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
      // 正常状态的员工账号
      const result = yield call(userService.adminUserlist, payload.data)
      if(result.status == 'OK') {
        yield put({
          type: 'updateData',
          payload: { data: result.data}
        })
      } else {
        message.error(result.message)
      }
    },
    *filterList({ payload: { data, from } }, { call, put }) {
      // 正常状态的员工账号
      const result = yield call(userService.adminUserlist, data)
      if(result.status == 'OK') {
        yield put({
          type: 'updateData',
          payload: { filterUserData: result.data.objects}
        })
        if(from === 'detail') {
          let user = find(result.data.objects, (o) => data.fullAccount === o.account)
          yield put({
            type: 'roles',
            payload: {
              data: {
                parentId: user.role && user.role.id
              }
            }
          })
        }
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload }, { call, put }) {
      const result = yield call(userService.detail, payload.id)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { detail: result.data } })
        if(result.data.role.id !== undefined) {
          yield put({
            type: 'filterList',
              payload: {
                data: {
                  fullAccount: result.data.parent.account,
                  limit: 1
                },
                from: 'detail'
              }
          })
          yield put({ type: 'getAssignedPermission', payload: { data: { roleId: result.data.role.id } } })
        }
      } else {
        message.error(result.message)
      }
    },
    *update({ payload }, { call, put }) {
      const { history, data, id } = payload
      const result = yield call(userService.update, data, id)
      if(result.status == 'OK') {
        message.success('操作成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { history, data } = payload
      const result = yield call(userService.addStaffs, data)
      if(result.status == 'OK') {
        message.success('操作成功')
        history.goBack()
      } else {
        message.error(result.message)
      }
    },
    *changeStatus({ payload }, { call, put }) {
      const { data, id, status } = payload
      const result = yield call(userService.changeStatus, id, { status })
      if(result.status == 'OK') {
        message.success('操作成功')
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
    *updateRoles({ payload }, { call, put }) {
      const { data, history } = payload
      const result = yield call(userService.updateRoles, data)
      if(result.status == 'OK') {
        message.success('操作成功')
        history.goBack()
      } else {
        message.error('操作失败，请联系客服')
      }
    },
    *roles({ payload = {} }, { call, put }) {
      const result = yield call(roleService.all, payload.data)
      if(result.status == 'OK') {
        yield put({
          type: 'updateData',
          payload: {
             roleData: result.data.objects,
             roleTree: intToString(arrayToTree(result.data.objects)),
          }
        })
      } else {
        result.message && message.error(result.message)
      }
    },
    *updatePassword({ payload: { data: { id, newPassword, oldPassword, rePassword, } }}, { call, put }) {
      const result = yield call(userService.updatePassword, id, { newPassword, oldPassword, rePassword })
      if(result.status == 'OK') {
        message.success('密码修改成功')
        yield put({ type: 'hideModal' })
      } else {
        message.error(result.message)
      }
    },
    *getAssignedPermission({ payload: { data } }, { call, put, select }) {
      // 拉取已被分配的权限
      const result = yield call(permissionService.rolePermission, data)
      const menuPermission = yield select(state => state.adminUser.menuPermission)
      if(result.status == 'OK') {
        const assignedPermissionList = result.data
        // 从已被分配角色里找出拥有的菜单所分组的权限
        const menuPermessionRel = menuPermission.filter(item => {
          return assignedPermissionList.some(value => {
            if(value.permission.type == 1 && value.permission.foreignId == item.menuId ) {
              return true
            }
          })
        })
        // 从已拥有的菜单对应的全量权限找出角色拥有的权限

        const assignedMenuPermessionRel = menuPermessionRel.filter(item => assignedPermissionList.some(value => item.permissionId == value.permission.id))
        const permissionData = groupBy(assignedMenuPermessionRel, 'menuId')
        let menuList = []
        for(let i = 0; i < assignedMenuPermessionRel.length; i++) {
          let item = assignedMenuPermessionRel[i]
          if(item.menu.url) {
            menuList.push(item.menu)
          }
        }
        menuList = uniqBy(menuList,'id')
        menuList.map(value => {
          if( permissionData[value.id]) {
            value.permission = permissionData[value.id].filter(item =>{
              if(item.permission.type != 1) {
                item.name = item.permission.name
                return true
              }
            })}
        })
        yield put({
          type: 'updateData',
          payload: {
            assignedPermissionList,
            permissionData: menuList
          }
        })
      } else {
        result.message && message.error(result.message)
      }
    },
    *initRoleData({ payload }, { call, put, select }) {
      yield put({
        type: 'updateData',
        payload: {
          roleData: [],
          permissionData: []
        }
      })
    },
    *menuPermission({ payload }, { call, put, select }) {
      const menuPermission = yield call(permissionService.menuPermission)
      if( menuPermission.status == 'OK') {
        yield put({
          type: 'updateData',
          payload: {
            menuPermission: menuPermission.data
          }
        })
      } else {
        menuPermission.message && message.error(menuPermission.message)
      }
    }
  }
}
