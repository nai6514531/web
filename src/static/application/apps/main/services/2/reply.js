import request from '../../utils/request'
const replyService = {
  list: (data) => {
    if(data.pagination  === false) {
      return request.get(`/2/replys?userId=${data.userId || ''}&name=${data.name || ''}&keywords=${data.keywords || ''}&commentId=${data.commentId || '' }`)
    }
    return request.get(`/2/replys?offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&keywords=${data.keywords || ''}&commentId=${data.commentId || '' }`)
  },
  detail: (id) => {
    return request.get(`/2/replys/${id}`)
  },
  update: (id, data) => {
    return request.put(`/2/replys/${id}`, data)
  },
  add: (data) => {
    return request.post(`/2/replys`, data)
  },
  updateStatus: (id, data) => {
    return request.put(`/2/replys/${id}/status`,data)
  }
}
export default replyService
