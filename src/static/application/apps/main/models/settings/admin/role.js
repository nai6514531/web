import { message } from 'antd'
import roleService from '../../../services/soda-manager/role.js'
import permissionService from '../../../services/soda-manager/permission.js'
import { cloneDeep } from 'lodash'
import { arrayToTree } from '../../../utils/'
const model = {
  key: 1,
  visible: false,
  data: [],
  permissonData: {
    objects: []
  },
  currentPermisson: [],
  currentId: '',
  record: {}
}
const genCascader = function(data) {
  function findParentId(pId) {
    let result = []
    data.forEach(d1 => {
      if(d1.id === pId){
        result.push(pId)
        result = result.concat(findParentId(d1.parentId))
      }
    })
    return result.reverse()
  }
  data.forEach(d1 => {
    d1.cascader = findParentId(d1.parentId)
  })
  return data
}
export default {
  namespace: 'adminRole',
  state: cloneDeep(model),
  reducers: {
    showModal(state, { payload: { data } }) {
      const record = data
      const visible = true
      return { ...state, visible, record }
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
      const result = yield call(roleService.all)
      if(result.status == 'OK') {
        yield put({ type: 'updateData', payload: { data: arrayToTree(genCascader(result.data.objects)) } })
      } else {
        result.message && message.error(result.message)
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
    }
  }
}
