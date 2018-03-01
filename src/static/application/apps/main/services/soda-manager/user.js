import request from '../../utils/request'
const userService = {
  list: (data) => {
    return request.get(`/mng/users?offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&account=${data.account || ''}&roleId=${data.roleId || ''}&type=${data.type}`)
  },
  adminUserlist: (data) => {
    return request.get(`/mng/admin/users?offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&account=${data.account || ''}&id=${data.id || ''}&keywords=${data.keywords || ''}`)
  },
  detail: (id) => {
    return request.get(`/mng/users/${id}`)
  },
  update: (data, id) => {
    return request.put(`/mng/users/${id}`, data)
  },
  add: (data) => {
    return request.post(`/mng/staffs`, data)
  },
  delete: (id) => {
    return request.delete(`/mng/users/${id}`)
  },
  userRoles: (id) => {
    return request.get(`/mng/user-roles?userId=${id || ''}`)
  },
  updateRoles: (data) => {
    return request.put(`/mng/user-roles`, data)
  },
  updatePassword: (id,data) => {
    // b端用户修改密码
    return request.put(`/mng/users/${id}/password`,data)
  },
  cashAccount: (data) => {
    return request.get(`/mng/cash-accounts/${data.userId}`)
  },
  updateCashAccount: (options) => {
    return request.put(`/mng/users/${options.id}/cash-accounts`, options)
  },
  GetDetailWithCashAccount: (options) => {
    return request.get(`/mng/users/${options.id}/cash-accounts`)
  },
  getDetailWithDevice: (options) => {
    return request.get(`/mng/business/device`, {
      params: options
    })
  }
}
export default userService
