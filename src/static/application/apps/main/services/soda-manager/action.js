import request from '../../utils/request'
const actionService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/mng/apis`
    } else if(data.noPagination) {
      url = `/mng/apis?key=${data.key || ''}&name=${data.name || ''}`
    } else {
      url = `/mng/apis?offset=${data.offset || 0 }&limit=${data.limit || 10 }&key=${data.key || ''}&name=${data.name || ''}`
    }
    return request.get(url)
  },
  update: (data, id) => {
    return request.put(`/mng/apis/${id}`, data)
  },
  add: (data) => {
    return request.post(`/mng/apis`, data)
  },
  detail: (id) => {
    return request.get(`/mng/apis/${id}`)
  },
  delete: (id) => {
    return request.delete(`/mng/apis/${id}`)
  },
}
export default actionService
