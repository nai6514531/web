import request from '../../utils/request'
const adConfigService = {
  list: (data, order) => {
    let url
    if(order) {
      url = `/advertisements?app_id=${data.app_id || '' }&location_id=${data.location_id || '' }`
    } else {
      url = `/advertisements?page=${data.page || 1 }&per_page=${data.per_page || 10 }&app_id=${data.app_id || '' }&location_id=${data.location_id || '' }&started_at=${data.started_at || '' }&ended_at=${data.ended_at || '' }&title=${data.title || '' }&display=${data.display || '' }&status=${data.status || '' }`
    }
    return request.get(url)
  },
  add: (data) => {
    return request.post(`/advertisements`, data)
  },
  update: (id, data) => {
    return request.put(`/advertisements/${id}`, data)
  },
  detail: (id) => {
    return request.get(`/advertisements/${id}`)
  },
  delete: (id) => {
    return request.delete(`/advertisements/${id}`)
  },
  upload: (data) => {
    return request.post(`/advertisements/images`, data)
  },
  order: (data) => {
    return request.put(`/advertisements/batch/orders`, data)
  }
}

export default adConfigService
