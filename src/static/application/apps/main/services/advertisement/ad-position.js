import request from '../../utils/request'
const adPositionService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/ad-positions`
    } else {
      url = `/ad-positions?offset=${data.offset || 0 }&limit=${data.limit || 10 }&appId=${data.appId || '' }`
    }
    return request.get(url)
  },
  add: (data) => {
    return request.post(`/ad-positions`, data)
  },
  update: (id, data) => {
    return request.put(`/ad-positions/${id}`, data)
  },
  detail: (id) => {
    return request.get(`/ad-positions/${id}`)
  },
  delete: (id) => {
    return request.delete(`/ad-positions/${id}`)
  },

}

export default adPositionService
