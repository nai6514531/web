import request from '../../utils/request'
const roleService = {
  list: () => {
    return request.get(`/roles`)
  },
  update: (data, id) => {
    return request.put(`/roles/${id}`, data)
  },
  add: (data) => {
    return request.post(`/roles`, data)
  },
  delete: (id) => {
    return request.delete(`/roles/${id}`)
  },
  permissions: (id) => {
    return request.get(`/roles/${id}/permissions`)
  },
  updatePermissions: (data, id) => {
    return request.put(`/roles/${id}/permissions`, data)
  },

}
export default roleService
