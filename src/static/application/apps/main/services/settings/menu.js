import request from '../../utils/request'
const menuService = {
  list: () => {
    return request.get(`/menus`)
  },
  update: (data, id) => {
    return request.put(`/menus/${id}`, data)
  },
  add: (data) => {
    return request.post(`/menus`, data)
  },
  delete: (id) => {
    return request.delete(`/menus/${id}`)
  },
}
export default menuService
