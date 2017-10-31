import request from '../../utils/request'
const bUserService = {
  /*list: (data) => {
    return request.get(`/crm/operators?offset=${data.offset || 0 }&limit=${data.limit || 10 }&keywords=${data.keywords || ''}`)
  },
  detail: (id) => {
    return request.get(`/crm/operators/${id}`)
  },
  updatePassword: (id,data) => {
    return request.put(`/crm/operators/${id}/password`,data)
  },*/
  cashAccount: (data) => {
    return request.get(`/cash-accounts/${data.userId}`)
  }
}
export default bUserService
