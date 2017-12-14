import request from '../../utils/request'
const likeService = {
  list: (data) => {
    let isRobot = !isNaN(data.isRobot) ? data.isRobot : ''
    let status = !isNaN(data.status) ? data.status : ''
    if(data.pagination  === false) {
      return request.get(`/2/likes?status=${status}&userId=${data.userId || ''}&topicId=${data.topicId || ''}&commentId=${data.commentId || ''}&replyId=${data.replyId || ''}&isRobot=${isRobot}`)
    }
    return request.get(`/2/likes?status=${status}&topicId=${data.topicId || ''}&commentId=${data.commentId || ''}&replyId=${data.replyId || ''}&isRobot=${isRobot}`)
  },
  batchLike: (data) => {
    return request.post(`/2/likes`, data)
  }
}
export default likeService
