import request from '../../utils/request'
const userService = {
  list: (data) => {
    if(data.pagination === false) {
      return request.get(`/2/users?name=${data.name || ''}&mobile=${data.mobile || ''}&isOfficial=${data.isOfficial || ''}&status=${data.status || ''}&schoolName=${data.schoolName || '' }`)
    }
    return request.get(`/2/users?offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&mobile=${data.mobile || ''}&isOfficial=${data.isOfficial || ''}&status=${data.status || ''}&schoolName=${data.schoolName || '' }`)
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
