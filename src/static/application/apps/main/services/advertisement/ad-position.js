import request from '../../utils/request'
const adPositionService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/ad-spaces`
    } else {
      url = `/ad-spaces?offset=${data.offset || 0 }&limit=${data.limit || 10 }&appId=${data.appId || '' }`
    }
    return request.get(url)
  },
  add: (data) => {
    return request.post(`/ad-spaces`, data)
  },
  update: (id, data) => {
    return request.put(`/ad-spaces/${id}`, data)
  },
  detail: (id) => {
    return request.get(`/ad-spaces/${id}`)
  },
  delete: (id) => {
    return request.delete(`/ad-spaces/${id}`)
  },

}

export default adPositionService
