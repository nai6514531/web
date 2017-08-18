import request from '../utils/request'
const userService = {
  info: () => {
    return request.get(`/profile`)
  },
  logout: () => {
    return request.post(`/logout`)
  }
}
export default userService
