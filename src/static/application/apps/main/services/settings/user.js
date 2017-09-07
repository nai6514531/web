import request from '../../utils/request'
const userService = {
  list: (data) => {
    return request.get(`/users?offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&account=${data.account || ''}&id=${data.id || ''}`)
  },
  detail: (id) => {
    return request.get(`/users/${id}`)
  },
  update: (data, id) => {
    return request.put(`/users/${id}`, data)
  },
  add: (data) => {
    return request.post(`/users`, data)
  },
  delete: (id) => {
    return request.delete(`/users/${id}`)
  },
  roles: (id) => {
    return request.get(`/users/${id}/roles`)
  },
  updateRoles: (data, id) => {
    return request.put(`/users/${id}/roles`, data)
  },
  reset: (data) => {
    return request.put(`/profile/password`, data)
  }
}
export default userService
