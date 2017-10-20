import request from '../../utils/request'
const adConfigService = {
  list: (data, order) => {
    let url
    if(order) {
      url = `/advertisements?appId=${data.appId || '' }&adPositionId=${data.adPositionId || '' }&status=0`
    } else {
      url = `/advertisements?offset=${data.offset || 0 }&limit=${data.limit || 10 }&appId=${data.appId || '' }&adPositionId=${data.adPositionId || '' }&startAt=${data.startAt || '' }&endAt=${data.endAt || '' }&name=${data.name || '' }&display=${data.display || '' }&status=${data.status || '' }`
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
  order: (data) => {
    return request.post(`/advertisements/batch/orders`, data)
  }
}

export default adConfigService
