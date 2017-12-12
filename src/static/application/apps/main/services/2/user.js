import request from '../../utils/request'
const userService = {
  list: (data) => {
    return request.get(`/2/users?offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&account=${data.mobile || ''}&isOfficial=${data.isOfficial || 0}&status=${data.status || 0 }&schoolName=${data.schoolName || '' }`)
  },
  detail: (id) => {
    return request.get(`/2/users/${id}`)
  },
  update: (id, data) => {
    return request.put(`/2/users/${id}`, data)
  },
  add: (data) => {
    return request.post(`/2/users`, data)
  },
  updateStatus: (data, id) => {
    return request.put(`/2/users/${id}/status`,data)
  }
}
export default userService
