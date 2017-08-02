import { storage, session } from '../../utils/storage.js'
import { message } from 'antd'
import userService from '../../services/user'
export default {
  namespace: 'common',
  state: {
    menuPopoverVisible: false,
    fold: false,
    navOpenKeys: [],
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
    }
  },
  effects: {
    *logout({ payload }, { call, put }) {
      const result = yield call(userService.logout)
      if(result.status == 'OK') {
        storage.clear('token')
        session.clear()
        payload.history.push('/')
      } else {
        message.error(result.message)
      }
    }
  }
}
