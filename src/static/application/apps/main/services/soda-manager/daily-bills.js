import request from '../../utils/request'

const dailyBillsService = {
  list: (options) => {
    return request.get(`/mng/daily-bills`, {
      params: options
    })
  },
  detail: (options) => {
    return request.get(`/mng/daily-bills/tickets/${options.id}`, {
    	params: options
    })
  },
  getTotalUnsettledBill: (options) => {
    return request.get(`/mng/daily-bills/unsettled-bill`, {
    	params: options
    })
  }
}
export default dailyBillsService
