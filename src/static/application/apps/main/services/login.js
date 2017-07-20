import request from '../utils/request'
const loginService = {
  login: (data) => {
    return request.post(`/login`,data)
  }
}

export default loginService
