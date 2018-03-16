import { message } from 'antd'
import userService from '../../services/soda-manager/user.js'
import roleService from '../../services/soda-manager/role.js'
import commonService from '../../services/common.js'
import permissionService from '../../services/soda-manager/permission.js'
import { storage, session } from '../../utils/storage.js'
import { cloneDeep, groupBy, uniqBy, sortBy } from 'lodash'
import { arrayToTree } from '../../utils/'

const model = {
  key: 1,
  visible: false,
  data: {
    objects: []
  },
  roleData: [],
  currentRole: -1,
  menuPermissionData: [],//树形结构的菜单权限对应数据
  assignedPermission: [],
  assignedPermissionIdList: []
}

export default {
  namespace: 'user',
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
      const result = yield call(userService.list, { ...payload.data, type: 1, status: 0 })
      if(result.status == 'OK') {
        yield put({
          type: 'updateData',
          payload: { data: result.data}
        })
      } else {
        message.error(result.message)
      }
    },
    *detail({ payload }, { call, put }) {
      const result = yield call(userService.detail, payload.id)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: result.data } })
        yield put({ type: 'getAssignedPermission', payload: { data: { roleId: result.data.role[0].id } } })
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
        // yield put({ type: 'common/info' })
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const result = yield call(userService.addStaffs, payload.data)
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
      const result = yield call(roleService.list)
      if(result.status == 'OK') {
        yield put({
          type: 'updateData',
          payload: { roleData: result.data}
        })
      } else {
        result.message && message.error(result.message)
      }
    },
    *assignedRoles({ payload }, { call, put }) {
      const { id } = payload
      const result = yield call(userService.userRoles, id)
      if(result.status == 'OK') {
        // yield put({
        //   type: 'showModal',
        //   payload: {
        //     data: result.data
        //   }
        // })
      } else {
        result.message && message.error(result.message)
      }
    },
    *updateRoles({ payload }, { call, put }) {
      const { data } = payload
      const result = yield call(userService.updateRoles, data)
      if(result.status == 'OK') {
        message.success('更新成功')
        // yield put({ type: 'hideModal' })
        yield put({ type: 'list', payload: { data: data.url } })
      } else {
        message.error(result.message)
      }
    },
    *updatePassword({ payload: { data: { id, password } }}, { call, put }) {
      const result = yield call(userService.updatePassword, id, { password })
      if(result.status == 'OK') {
        message.success('密码修改成功')
        yield put({ type: 'hideModal' })
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
    },
    *getAssignedPermission({ payload: { data } }, { call, put, select }) {
      // 拉取已被分配的权限
      const result = yield call(permissionService.rolePermission, data)
      const menuPermission = yield select(state => state.user.menuPermission)
      if( result.status == 'OK') {
        const assignedPermissionIdList = result.data.map(value => value.permissionId)
        const menuPermessionRel = menuPermission.filter(item => assignedPermissionIdList.some(id => item.permissionId === id))
        const menuList = uniqBy(menuPermessionRel.map(value => value.menu), function(value) {
          return value.id
        })
        const permissionGroup = groupBy(menuPermessionRel, 'menuId')
        menuList.map(value => {
          if( permissionGroup[value.id]) {
            value.permission = permissionGroup[value.id].map(item =>  item.permission)
          } else {
            value.permission = []
          }
        })
        yield put({
          type: 'updateData',
          payload: {
            assignedPermission: result.data,
            assignedPermissionIdList,
            permissionGroup: arrayToTree(menuList)
          }
        })
      } else {
        result.message && message.error(result.message)
      }
    },
    *menuPermission({ payload }, { call, put, select }) {
      // 拉取菜单和权限的对应关系
      const data = yield select(state => state.common.userInfo.menuList)
      const menuPermission = yield call(permissionService.menuPermission)
      const assignedPermissionIdList = yield select(state => state.user.assignedPermissionIdList)
      // console.log("assignedPermissionIdList2",assignedPermissionIdList)
      // console.log("menuPermission2",menuPermission)
      if( menuPermission.status == 'OK') {
        // const permissionGroup = groupBy(menuPermission.data, 'menuId')
        // data.map(value => {
        //   if( permissionGroup[value.id]) {
        //     // 默认checkbox不可以编辑
        //     value.permission = permissionGroup[value.id].map(item =>  item.permission)
        //     value.checkedList = assignedPermissionIdList.filter(id => value.permission.some(item => item.id === id))
        //   } else {
        //     value.permission = []
        //     value.checkedList = []
        //   }
        // })
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
