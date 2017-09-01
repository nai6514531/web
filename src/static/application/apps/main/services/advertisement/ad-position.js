import request from '../../utils/request'
const adPositionService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/ad-spaces`
    } else {
      url = `/ad-spaces?page=${data.page || 1 }&per_page=${data.per_page || 10 }&app_id=${data.app_id || '' }`
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
