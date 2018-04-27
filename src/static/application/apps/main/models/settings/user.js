import { message } from 'antd'
import userService from '../../services/soda-manager/user.js'
import roleService from '../../services/soda-manager/role.js'
import commonService from '../../services/common.js'
import permissionService from '../../services/soda-manager/permission.js'
import { storage, session } from '../../utils/storage.js'
import { cloneDeep, groupBy, uniqBy, sortBy, remove } from 'lodash'
import { arrayToTree } from '../../utils/'

const model = {
  key: 1,
  visible: false,
  data: {
    objects: []
  },
  roleData: [],
  activeKey: '',
  currentRole: -1,
  menuPermissionData: [],//树形结构的菜单权限对应数据
  assignedPermissionList: [],
  permissionData: []
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
      const result = yield call(userService.list, { ...payload.data, type: 1 })
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
        if(result.data.role.id !== undefined) {
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
        const { roleId, userId } = payload.role
        yield put({
          type: 'updateRoles',
          payload: {
            data: {
              userId: userId,
              roleIds: [roleId]
            },
            history
          }
        })
        // message.success('更新用户信息成功')
        // yield put({ type: 'common/info' })
      } else {
        message.error(result.message)
      }
    },
    *add({ payload }, { call, put }) {
      const { history } = payload
      const result = yield call(userService.addStaffs, payload.data)
      if(result.status == 'OK') {
        const { roleId } = payload.role
        yield put({
          type: 'updateRoles',
          payload: {
            data: {
              userId:  result.data.id,
              roleIds: [roleId]
            },
            history
          }
        })
        // message.success('添加成功')
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
    *roles({ payload }, { call, put }) {
      const result = yield call(roleService.list)
      if(result.status == 'OK') {
        const roleData = remove(result.data.objects, function(obj) {
          // 过滤运营商角色
          return obj.id !== 2
        })
        yield put({
          type: 'updateData',
          payload: { roleData }
        })
      } else {
        result.message && message.error(result.message)
      }
    },
    *updatePassword({ payload: { data: { id, newPassword, oldPassword } }}, { call, put }) {
      const result = yield call(userService.updatePassword, id, { newPassword, oldPassword })
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
      const menuPermission = yield select(state => state.user.menuPermission)
      if( result.status == 'OK') {
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
        // console.log("menuPermessionRel",menuPermessionRel)
        // console.log("assignedMenuPermessionRel",assignedMenuPermessionRel)
        // console.log("assignedPermissionList",assignedPermissionList)
        // console.log("permissionData",permissionData)
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
    *menuPermission({ payload }, { call, put, select }) {
      // 拉取菜单和权限的对应关系
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
