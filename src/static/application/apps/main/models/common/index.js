import { storage, session } from '../../utils/storage.js'
import { message } from 'antd'
import userService from '../../services/user'
export default {
  namespace: 'common',
  state: {
    menuPopoverVisible: false,
    fold: false,
    navOpenKeys: [],
    userInfo: {
      user: {},
      menuList: [],
      actionList: [],
      elementList: []
    }
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
