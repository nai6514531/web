import request from '../../utils/request'
const circleService = {
  list: (data) => {
    let url = `/2/circles?offset=${data.offset || 0 }&limit=${data.limit || 10 }&provinceId=${Number(data.provinceId) || ''}`
    return request.get(url)
  },
  summary: () => {
    return request.get('/2/circles/summary')
  },
  topicList: (data) => {
    let url = `/2/topics?offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&schoolName=${data.schoolName || ''}&channelId=${ data.channelId || ''}&status=${ data.status || ''}&keywords=${data.keywords || ''}&cityId=${data.cityId || ''}`
    return request.get(url)
  },
  topicDetail: (id) => {
    let url = `/2/topics/${id}`
    return request.get(url)
  },
  moveTopic: (id, data) => {
    let url = `/2/topics/${id}/channel`
    return request.put(url, data)
  },
  upDateTopicStatus: (id, data) => {
    let url = `/2/topics/${id}/status`
    return request.put(url, data)
  },
  channel: () => {
    return request.get(`/2/channels`)
  },
}
export default circleService
