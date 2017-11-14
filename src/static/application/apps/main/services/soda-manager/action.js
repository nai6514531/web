import request from '../../utils/request'
const actionService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/mng/actions`
    } else if(data.noPagination) {
      url = `/mng/actions?handlerName=${data.handlerName || ''}&method=${data.method || ''}`
    } else {
      url = `/mng/actions?offset=${data.offset || 0 }&limit=${data.limit || 10 }&handlerName=${data.handlerName || ''}&method=${data.method || ''}`
    }
    return request.get(url)
  },
  update: (data, id) => {
    return request.put(`/mng/actions/${id}`, data)
  },
  add: (data) => {
    return request.post(`/mng/actions`, data)
  },
  detail: (id) => {
    return request.get(`/mng/actions/${id}`)
  },
  delete: (id) => {
    return request.delete(`/mng/actions/${id}`)
  },
}
export default actionService
