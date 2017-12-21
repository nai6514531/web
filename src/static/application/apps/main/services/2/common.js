import request from '../../utils/request'
const commonService = {
  topicCount: (id) => {
    return request.get(`/2/topic-count/channels/${id}`)
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
