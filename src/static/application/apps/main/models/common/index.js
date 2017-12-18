import { storage, session } from '../../utils/storage.js'
import { message } from 'antd'
import commonService from '../../services/common.js'

export default {
  namespace: 'common',
  state: {
    menuPopoverVisible: false,
    fold: false,
    navOpenKeys: [],
    selectedKeys: [],
    clickedIndex: -1,
    userInfo: {
      user: null,
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
    handleSelectedKeys(state, { payload: selectedKeys }) {
      return {
        ...state,
        ...selectedKeys,
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
      const result = yield call(commonService.logout)
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
      const result = yield call(commonService.profile)
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
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        console.log('location', location)
      });
    }
  }
}
