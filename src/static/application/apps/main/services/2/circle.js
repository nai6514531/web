import request from '../../utils/request'
const circleService = {
  list: (data) => {
    let url = `/2/circles?page=${data.page || 1 }&per_page=${data.per_page || 10 }&province_id=${data.province_id || ''}`
    return request.get(url)
  },
  topicList: (data) => {
    let url = `/2/topics?page=${data.page || 1 }&per_page=${data.per_page || 10 }&name=${data.name || ''}&school_name=${data.school_name || ''}&channel_id=${ data.channel_id || ''}&status=${ data.status || ''}&key_word=${data.keywords || ''}&city_id=${data.city_id || ''}`
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
