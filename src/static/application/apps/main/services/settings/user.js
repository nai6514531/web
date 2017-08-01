import request from '../../utils/request'
const userService = {
  list: (data) => {
    return request.get(`/users?page=${data.page}&per_page=${data.per_page}`)
  },
  detail: (id) => {
    return request.get(`/user/${id}`)
  },
  update: (data) => {
    return request.put(`/user/${data.id}`, data)
  },
  add: (data) => {
    return request.post(`/user`, data)
  },
  delete: (id) => {
    return request.delete(`/user/${id}`)
  },
}
export default userService
