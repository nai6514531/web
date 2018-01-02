import request from '../../utils/request'
const supplierService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/game/suppliers`
    } else {
      url = `/game/suppliers?offset=${data.offset || 0 }&limit=${data.limit || 10 }&id=${data.id || ''}&status=${data.status || ''}`    
    }
    return request.get(url)
  },
  detail: (id) => {
    return request.get(`/game/supplier/${id}`)
  },
  add: (data) => {
    let url = `/game/supplier`
    return request.post(url, data)
  },
  update: (id, data) => {
    let url = `/game/supplier/${id}`
    return request.put(url, data)
  },
}
export default supplierService
