import request from '../../utils/request'
const roleService = {
  list: (options) => {
    return request.get(`/mng/roles`,{ params: options })
  },
  update: (data, id) => {
    return request.put(`/mng/roles/${id}`, data)
  },
  add: (data) => {
    return request.post(`/mng/roles`, data)
  },
  detail: (id) => {
    return request.get(`/mng/roles/${id}`)
  },
  delete: (id) => {
    return request.delete(`/mng/roles/${id}`)
  },
  permissions: (id) => {
    return request.get(`/mng/roles/${id}/permissions`)
  },
  updatePermissions: (data, id) => {
    return request.put(`/mng/roles/${id}/permissions`, data)
  },

}
export default roleService
