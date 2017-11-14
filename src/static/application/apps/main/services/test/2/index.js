import request from '../../utils/request'
const commonService = {
  topicCount: (data) => {
    return request.post(`/2/topic-count/channels`, data)
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
export default commonService
