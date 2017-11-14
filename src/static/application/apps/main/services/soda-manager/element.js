import request from '../../utils/request'
const elementService = {
  list: () => {
    return request.get(`/mng/elements`)
  },
  detail: (id) => {
    return request.get(`/mng/elements/${id}`)
  },
  update: (data, id) => {
    return request.put(`/mng/elements/${id}`, data)
  },
  add: (data) => {
    return request.post(`/mng/elements`, data)
  },
  delete: (id) => {
    return request.delete(`/mng/elements/${id}`)
  },
}
export default elementService
