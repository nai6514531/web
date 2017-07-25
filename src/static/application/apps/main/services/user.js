import request from '../utils/request'
const userService = {
  info: () => {
    return request.get(`/profile/session`)
  },
  logout: () => {
    return request.get(`/logout`)
  }
}
export default userService
