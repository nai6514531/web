import request from '../utils/request'

const dailyBillsService = {
  getDetail: (options) => {
    return request.get(`/daily-bills/${options.id}`, {
    	params: options
    })
  },
  getTotalUnsettledBill: (options) => {
    return request.get(`/daily-bills/unsettled-bill`, {
    	params: options
    })
  }
}
export default dailyBillsService
