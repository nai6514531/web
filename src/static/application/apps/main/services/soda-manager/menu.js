import request from '../../utils/request'
const menuService = {
  list: () => {
    return request.get(`/mng/menus`)
  },
  detail: (id) => {
    return request.get(`/mng/menus/${id}`)
  },
  update: (data, id) => {
    return request.put(`/mng/menus/${id}`, data)
  },
  add: (data) => {
    return request.post(`/mng/menus`, data)
  },
  delete: (id) => {
    return request.delete(`/mng/menus/${id}`)
  },
  order: (data) => {
    return request.post(`/mng/menus/batch/orders`,data)
  },
}
export default menuService
