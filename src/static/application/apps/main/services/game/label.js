import request from '../../utils/request'
const labelService = {
  list: () => {
    let url
    url = `/game/labels`
    return request.get(url)
  },
  detail: (id) => {
    return request.get(`/game/label/${id}`)
  },
  add: (data) => {
    let url = `/game/label`
    return request.post(url, data)
  },
  update: (id, data) => {
    let url = `/game/label/${id}`
    return request.put(url, data)
  },
  delete: (id) => {
    return request.delete(`/game/label/${id}`)
  }
}
export default labelService
