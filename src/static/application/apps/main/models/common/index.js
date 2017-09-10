import { storage, session } from '../../utils/storage.js'
import { message } from 'antd'
import userService from '../../services/user'
export default {
  namespace: 'common',
  state: {
    menuPopoverVisible: false,
    fold: false,
    navOpenKeys: [],
    clickedIndex: -1,
    userInfo: {
      user: {},
      menuList: [],
      actionList: [],
      elementList: []
    },
    search: {}
  },
  reducers: {
    popMenu(state, { payload: { menuPopoverVisible } }) {
      return { ...state, menuPopoverVisible }
    },
    foldMenu(state, { payload: { fold } }) {
      return { ...state, fold }
    },
    handleNavOpenKeys(state, { payload: navOpenKeys }) {
      return {
        ...state,
        ...navOpenKeys,
      }
    },
    updateSearch(state, { payload: { search } }) {
      search = { ...state.search, ...search }
      return {
        ...state,
        search
      }
    },
    resetSearch(state) {
      return {
        ...state,
        search: {}
      }
    },
    updateIndex(state, { payload: index }) {
      const clickedIndex = index
      return {
        ...state,
        clickedIndex
      }
    },
    resetIndex(state) {
      const clickedIndex = -1
      return {
        ...state,
        clickedIndex
      }
    },
    updateUesrInfo(state, { payload: userInfo }) {
      return {
        ...state,
        userInfo,
      }
    }
  },
  effects: {
    *logout({ payload }, { call, put }) {
      const result = yield call(userService.logout)
      if(result.status == 'OK') {
        storage.clear('token')
        // storage.clear('userInfo')
        session.clear()
        payload.history.push('/')
      } else {
        message.error(result.message)
      }
    },
    *info ({
      payload,
    }, { put, call }) {
      // 获取用户信息
      const result = yield call(userService.info)
      if(result.status === 'OK') {
        // storage.val('userInfo', result.data)
         yield put({
          type: 'updateUesrInfo',
          payload: result.data
        })
      } else {
        message.error(result.message)
      }
    }
  }
}
