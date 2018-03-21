import request from '../../utils/request'
const userService = {
  list: (options) => {
    return request.get(`/mng/users`, { params: options })
  },
  adminUserlist: (options) => {
    return request.get(`/mng/admin/users`, { params: options })
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
  addStaffs: (data) => {
    return request.post(`/mng/staffs`, data)
  },
  changeStatus: (id, data) => {
    return request.put(`/mng/users/${id}/status`, data)
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
    return request.get(`/mng/user-cash-accounts/${data.userId}`)
  },
  updateCashAccount: (options) => {
    return request.put(`/mng/user-cash-accounts/${options.id}`, options)
  },
  getDetailWithDevice: (options) => {
    return request.get(`/mng/users-devices`, {
      params: options
    })
  }

}
export default userService
