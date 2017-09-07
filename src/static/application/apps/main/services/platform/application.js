import request from '../../utils/request'
const applicationService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/applications`
    } else {
      url = `/applications?offset=${data.offset || 0 }&limit=${data.limit || 10 }`
    }
    return request.get(url)
  },
  add: (data) => {
    return request.post(`/applications`, data)
  },
  update: (id, data) => {
    return request.put(`/applications/${id}`, data)
  },
  detail: (id) => {
    return request.get(`/applications/${id}`)
  },
  delete: (id) => {
    return request.delete(`/applications/${id}`)
  },

}

export default applicationService
