import request from '../../utils/request'
const channelService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/2/channels?status=0`
    } else {
      url = `/2/channels?offset=${data.offset || 0 }&limit=${data.limit || 10 }`
    }
    return request.get(url)
  },
  detail: (id) => {
    return request.get(`/2/channels/${id}`)
  },
  upDateChannelStatus: (id, data) => {
    let url = `/2/channels/${id}/status`
    return request.put(url, data)
  },
  update: (id, data) => {
    let url = `/2/channels/${id}`
    return request.put(url, data)
  },
  add: (data) => {
    let url = `/2/channels`
    return request.post(url, data)
  },
  order: (data) => {
    return request.post(`/2/channels/batch/orders`, data)
  }
}
export default channelService
