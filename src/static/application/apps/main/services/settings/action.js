import request from '../../utils/request'
const actionService = {
  list: () => {
    return request.get(`/actions`)
  },
  update: (data, id) => {
    return request.put(`/actions/${id}`, data)
  },
  add: (data) => {
    return request.post(`/actions`, data)
  },
  delete: (id) => {
    return request.delete(`/actions/${id}`)
  },
}
export default actionService
