import request from '../../../utils/request'
const operatorService = {
  list: () => {
    return request.get(`/crm/operators`)
  },
  detail: (id) => {
    return request.get(`/crm/operators/${id}`)
  },
  updatePassword: (id) => {
    return request.put(`/crm/operators/${id}/password`,data)
  }

}
export default operatorService
