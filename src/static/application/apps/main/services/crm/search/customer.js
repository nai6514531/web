import request from '../../../utils/request'
const customerService = {
  list: (mobile) => {
    return request.get(`/crm/customers/${mobile}`)
  },
  updatePassword: (mobile,data) => {
    return request.put(`/crm/customers/${mobile}/password`,data)
  },
  walletsList: (mobile) => {
    return request.get(`/crm/wallets/${mobile}`)
  },
  chipcardsList: (mobile) => {
    return request.get(`/crm/chipcards/${mobile}`)
  },
  ticketsList: (mobile) => {
    return request.get(`/crm/tickets/${mobile}`)
  },
  billsList: () => {
    return request.get(`/crm/bills`)
  },
  chipcardBillsList: (mobile) => {
    return request.get(`/crm/chipcard-bills`)
  },
}
export default customerService
