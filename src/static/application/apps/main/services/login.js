import request from '../utils/request'
const loginService = {
  login: (data) => {
    return request.get(`/login?account=${data.account}&password=${data.password}&captcha=${data.captcha}`)
  }
}

export default loginService
