import request from '../../utils/request'
const menuService = {
  list: () => {
    return request.get(`/menus`)
  },
  update: (data) => {
    return request.put(`/menu/${data.id}`, data)
  },
  add: (data) => {
    return request.post(`/menu`, data)
  },
  delete: (id) => {
    return request.delete(`/menu/${id}`)
  },
}
export default menuService
