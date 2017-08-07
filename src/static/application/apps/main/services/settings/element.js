import request from '../../utils/request'
const elementService = {
  list: () => {
    return request.get(`/elements`)
  },
  update: (data, id) => {
    return request.put(`/elements/${id}`, data)
  },
  add: (data) => {
    return request.post(`/elements`, data)
  },
  delete: (id) => {
    return request.delete(`/elements/${id}`)
  },
}
export default elementService
