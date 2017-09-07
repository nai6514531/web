import request from '../../utils/request'
const permissionService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/permissions`
    } else {
      url = `/permissions?offset=${data.offset || 0 }&limit=${data.limit || 10 }`
    }
    return request.get(url)
  },
  update: (data, id) => {
    return request.put(`/permissions/${id}`, data)
  },
  add: (data) => {
    return request.post(`/permissions`, data)
  },
  delete: (id) => {
    return request.delete(`/permissions/${id}`)
  },
  menu: (id) => {
    return request.get(`/permissions/${id}/menus`)
  },
  action: (id) => {
    return request.get(`/permissions/${id}/actions`)
  },
  element: (id) => {
    return request.get(`/permissions/${id}/elements`)
  },
  updateMenu: (data, id) => {
    return request.put(`/permissions/${id}/menus`, data)
  },
  updateElement: (data, id) => {
    return request.put(`/permissions/${id}/elements`, data)
  },
  updateAction: (data, id) => {
    return request.put(`/permissions/${id}/actions`, data)
  }
}
export default permissionService
