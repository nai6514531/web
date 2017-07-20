import request from '../utils/request'
const userService = {
  info: () => {
    return request.get(`/session/info`)
  },
  logout: () => {
    return request.get(`/logout`)
  }
}
export default userService
