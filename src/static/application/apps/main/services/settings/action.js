import request from '../../utils/request'
const actionService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/actions`
    } else if(data.noPagination) {
      url = `/actions?handlerName=${data.handlerName || ''}&method=${data.method || ''}`
    } else {
      url = `/actions?offset=${data.offset || 0 }&limit=${data.limit || 10 }&handlerName=${data.handlerName || ''}&method=${data.method || ''}`
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
