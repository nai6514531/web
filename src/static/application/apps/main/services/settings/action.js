import request from '../../utils/request'
const actionService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/actions`
    } else if(data.noPagination) {
      url = `/actions?handler_name=${data.handler_name || ''}&method=${data.method || ''}`
    } else {
      url = `/actions?page=${data.page || 1 }&per_page=${data.per_page || 10 }&handler_name=${data.handler_name || ''}&method=${data.method || ''}`
    }
    return request.get(url)
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
