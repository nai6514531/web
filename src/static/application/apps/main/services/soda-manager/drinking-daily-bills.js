import request from '../../utils/request'

const drinkingDailyBillsService = {
  list: (options) => {
    return request.get(`/mng/drinking-daily-bills`, {
      params: options
    })
  },
  getTickets: (options) => {
    return request.get(`/mng/drinking-daily-bills/tickets/${options.id}`, {
    	params: options
    })
  },
}
export default drinkingDailyBillsService
