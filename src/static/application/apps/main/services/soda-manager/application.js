import request from '../../utils/request'
const applicationService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/mng/applications`
    } else {
      url = `/mng/applications?offset=${data.offset || 0 }&limit=${data.limit || 10 }`
    }
    return request.get(url)
  },
  add: (data) => {
    return request.post(`/mng/applications`, data)
  },
  update: (id, data) => {
    return request.put(`/mng/applications/${id}`, data)
  },
  detail: (id) => {
    return request.get(`/mng/applications/${id}`)
  },
  delete: (id) => {
    return request.delete(`/mng/applications/${id}`)
  }
}

export default applicationService
