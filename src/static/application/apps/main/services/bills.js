import request from '../utils/request'

const billsService = {
  get: (data) => {
    return request.get(`/api/bills`, {
    	params: data
    })
  },
  getDetail: (options) => {
    return request.get(`/api/bills/${options.id}`, {
    	params: options
    })
  }
}
export default billsService
