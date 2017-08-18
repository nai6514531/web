import request from '../utils/request'

const dailyBillsService = {
  getDetail: (options) => {
    return request.get(`/daily-bills/${options.id}`, {
    	params: options
    })
  }
}
export default dailyBillsService
