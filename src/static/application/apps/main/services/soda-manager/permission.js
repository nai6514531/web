import request from '../../utils/request'
const permissionService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/mng/permissions`
    } else {
      url = `/mng/permissions?offset=${data.offset || 0 }&limit=${data.limit || 10 }`
    }
    return request.get(url)
  },
  detail: (data, id) => {
    return request.get(`/mng/permissions/${id}`, data)
  },
  update: (data, id) => {
    return request.put(`/mng/permissions/${id}`, data)
  },
  add: (data) => {
    return request.post(`/mng/permissions`, data)
  },
  delete: (id) => {
    return request.delete(`/mng/permissions/${id}`)
  },
  menu: (id) => {
    return request.get(`/mng/permissions/${id}/menus`)
  },
  action: (id) => {
    return request.get(`/mng/permissions/${id}/apis`)
  },
  element: (id) => {
    return request.get(`/mng/permissions/${id}/elements`)
  },
  updateMenu: (data, id) => {
    return request.put(`/mng/permissions/${id}/menus`, data)
  },
  updateElement: (data, id) => {
    return request.put(`/mng/permissions/${id}/elements`, data)
  },
  updateAction: (data, id) => {
    return request.put(`/mng/permissions/${id}/apis`, data)
  },
  getRecharge: () => {
    return request.get(`/mng/chipcard/permissions/recharge`)
  },
}
export default permissionService
