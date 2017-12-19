import request from '../../utils/request'
const billboardService = {
  list: () => {
    let url
    url = `/game/billboards`
    return request.get(url)
  },
  detail: (id) => {
    return request.get(`/game/billboard/${id}`)
  },
  add: (data) => {
    let url = `/game/billboard`
    return request.post(url, data)
  },
  update: (id, data) => {
    let url = `/game/billboard/${id}`
    return request.put(url, data)
  },
  delete: (id) => {
    return request.delete(`/game/billboard/${id}`)
  }
}
export default billboardService
