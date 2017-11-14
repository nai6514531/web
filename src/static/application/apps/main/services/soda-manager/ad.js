import request from '../../utils/request'
const adService = {
  adList: (data, order) => {
    let url
    if(order) {
      url = `/mng/advertisements?appId=${data.appId || '' }&adPositionId=${data.adPositionId || '' }&status=0`
    } else {
      url = `/mng/advertisements?offset=${data.offset || 0 }&limit=${data.limit || 10 }&appId=${data.appId || '' }&adPositionId=${data.adPositionId || '' }&startAt=${data.startAt || '' }&endAt=${data.endAt || '' }&name=${data.name || '' }&display=${data.display || '' }&status=${data.status || '' }`
    }
    return request.get(url)
  },
  adAdd: (data) => {
    return request.post(`/mng/advertisements`, data)
  },
  adUpdate: (id, data) => {
    return request.put(`/mng/advertisements/${id}`, data)
  },
  adDetail: (id) => {
    return request.get(`/mng/advertisements/${id}`)
  },
  adDelete: (id) => {
    return request.delete(`/mng/advertisements/${id}`)
  },
  adOrder: (data) => {
    return request.post(`/mng/advertisements/batch/orders`, data)
  },
  adPositionList: (data) => {
    let url
    if(!data) {
      url = `/mng/ad-positions`
    } else {
      url = `/mng/ad-positions?offset=${data.offset || 0 }&limit=${data.limit || 10 }&appId=${data.appId || '' }`
    }
    return request.get(url)
  },
  adPositionAdd: (data) => {
    return request.post(`/mng/ad-positions`, data)
  },
  adPositionUpdate: (id, data) => {
    return request.put(`/mng/ad-positions/${id}`, data)
  },
  adPositionDetail: (id) => {
    return request.get(`/mng/ad-positions/${id}`)
  },
  adPositionDelete: (id) => {
    return request.delete(`/mng/ad-positions/${id}`)
  }
}
export default adService
