import request from '../../utils/request'
const permissionService = {
  list: (data) => {
    let url
    if(data && data.noPagination) {
      url = `/mng/permissions?name=${data.name || ''}`
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
  adminMenuPermission: (data ={}) => {
    return request.get(`/mng/admin/menu-permissions?menuId=${data.menuId || ''}`)
  },
  menuPermission: (data ={}) => {
    return request.get(`/mng/menu-permissions?menuId=${data.menuId || ''}`)
  },
  updatePermission: (data ={}) => {
    return request.put(`/mng/menu-permissions`,data)
  },
  rolePermission: (data ={}) => {
    return request.get(`/mng/role-permissions?roleId=${data.roleId || ''}`)
  },
  assignPermission: (data ={}) => {
    return request.put(`/mng/role-permissions`,data)
  },
  syncPermission: () => {
    return request.put(`/mng/permissions/actions/synchronize`)
  },
}
export default permissionService
