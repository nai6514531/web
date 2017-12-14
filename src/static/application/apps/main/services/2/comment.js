import request from '../../utils/request'
const commentService = {
  list: (data) => {
    let status = !isNaN(data.status) ? data.status : ''
    if(data.pagination  === false) {
      return request.get(`/2/comments?status=${status}&name=${data.name || ''}&userId=${data.userId || '' }&keywords=${data.keywords || ''}&order=${data.order || '' }&topicId=${data.topicId || '' }`)
    }
    return request.get(`/2/comments?status=${status}&offset=${data.offset || 0 }&limit=${data.limit || 10 }&name=${data.name || ''}&keywords=${data.keywords || ''}&order=${data.order || '' }&topicId=${data.topicId || '' }`)
  },
  detail: (id) => {
    return request.get(`/2/comments/${id}`)
  },
  update: (id, data) => {
    return request.put(`/2/comments/${id}`, data)
  },
  add: (data) => {
    return request.post(`/2/comments`, data)
  },
  updateStatus: (id, data) => {
    return request.put(`/2/comments/${id}/status`,data)
  }
}
export default commentService
