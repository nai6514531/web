import request from '../../utils/request'
const userService = {
  list: (data) => {
    return request.get(`/mng/users?offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&account=${data.account || ''}&id=${data.id || ''}&keywords=${data.keywords || ''}`)
  },
  detail: (id) => {
    return request.get(`/mng/users/${id}`)
  },
  update: (data, id) => {
    return request.put(`/mng/users/${id}`, data)
  },
  add: (data) => {
    return request.post(`/mng/users`, data)
  },
  delete: (id) => {
    return request.delete(`/mng/users/${id}`)
  },
  roles: (id) => {
    return request.get(`/mng/users/${id}/roles`)
  },
  updateRoles: (data, id) => {
    return request.put(`/mng/users/${id}/roles`, data)
  },
  updatePassword: (id,data) => {
    // b端用户修改密码
    return request.put(`/mng/users/${id}/password`,data)
  },
  cashAccount: (data) => {
    return request.get(`/mng/cash-accounts/${data.userId}`)
  }
}
export default userService
