import request from '../../utils/request'
const cityService = {
  list: (data) => {
    let url = `/2/cities?offset=${data.offset || 0 }&limit=${data.limit || 10 }&provinceId=${Number(data.provinceId) || ''}`
    return request.get(url)
  },
  summary: () => {
    return request.get('/2/cities/summary')
  },
  topicList: (data) => {
    let url = `/2/topics?offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&schoolName=${data.schoolName || ''}&channelId=${ data.channelId || ''}&status=${ data.status || ''}&keywords=${data.keywords || ''}&cityId=${data.cityId || ''}&startAt=${data.startAt || '' }&endAt=${data.endAt || '' }`
    return request.get(url)
  },
  topicDetail: (id) => {
    let url = `/2/topics/${id}`
    return request.get(url)
  },
  topicAdd: (data) => {
    let url = `/2/topics`
    return request.post(url, data)
  },
  topicUpdate: (id, data) => {
    let url = `/2/topics/${id}`
    return request.put(url, data)
  },
  moveTopic: (id, data) => {
    let url = `/2/topics/${id}/channel`
    return request.put(url, data)
  },
  upDateTopicStatus: (id, data) => {
    let url = `/2/topics/${id}/status`
    return request.put(url, data)
  },
  inboxConsultation: (data) => {
    let { topicId, channelId } = data
    let url
    if(channelId) {
      url = `/2/inbox/consultation?channelId=${channelId}`
    }
    if(topicId) {
      url = `/2/inbox/consultation?topicId=${topicId}`
    }
    return request.get(url)
  },
}
export default cityService
