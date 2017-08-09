import request from '../utils/request'

const dailyBillsService = {
  getDetail: (options) => {
    return request.get(`/api/daily-bills/${options.id}`, {
    	params: options
    })
  }
}
export default dailyBillsService
