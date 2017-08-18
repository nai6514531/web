import request from '../utils/request'

const billsService = {
  get: (data) => {
    return request.get(`/bills`, {
    	params: data
    })
  },
  getDetail: (options) => {
    return request.get(`/bills/${options.id}`, {
    	params: options
    })
  }
}
export default billsService
