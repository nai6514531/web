import request from '../utils/request'
const commonService = {
  reset: (data) => {
    // 设置里的修改密码
    return request.put(`/profile/password`, data)
  },
  captcha: () => {
    return request.get(`/captcha?${Date.now()}`)
  },
  smsList: (data) => {
    let date = data.date ? data.date.replace(/-/g,'') : ''
    let url = `/sms/${ data.mobile }?offset=${data.offset || 0 }&limit=${data.limit || 10 }&date=${ date }`
    return request.get(url)
  },
  login: (data) => {
    return request.post(`/login`,data)
  },
  profile: () => {
    return request.get(`/profile`)
  },
  logout: () => {
    return request.post(`/logout`)
  },
  timestamp: () => {
    return request.get(`/timestamp`)
  }
}
export default commonService
