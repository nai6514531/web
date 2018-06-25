import request from '../../utils/request';
const sodaService = {
  refund: (id) => {
    return request.post(`/soda/tickets/${id}/refund`)
  },
  export: (data) => {
    return request.get(`/soda/consumptions/excel/export`, {params: data})
  },
  ticketsList: (data) => {
    let url = `/soda/tickets?offset=${data.offset || 0 }&limit=${data.limit || 10 }&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}&customerMobile=${data.customerMobile || ''}&ownerId=${data.userId || ''}&status=${data.status || ''}`
    return request.get(url)
  },
  drinkingTicketsList: (data) => {
    let url = `/soda/drinking-tickets?offset=${data.offset || 0 }&limit=${data.limit || 10 }&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}&customerMobile=${data.customerMobile || ''}&ownerId=${data.userId || ''}&status=${data.status || ''}`
    return request.get(url)
  },
  ticketDetail: (id) => {
    let url = `/soda/tickets/${id}`
    return request.get(url)
  },
  billsList: (data) => {
    const { mobile, url: { offset, limit, startAt, endAt, action, type } } =  data
    return request.get(`/soda/bills?mobile=${mobile}&limit=${limit || 10 }&offset=${offset || 0}&startAt=${startAt || ''}&endAt=${endAt || ''}&action=${action || ''}&type=${type || ''}`)
  },
  chipcards: (mobile) => {
    return request.get(`/soda/chipcards/${mobile}`)
  },
  chipcardBillsList: (data) => {
    const { mobile, url: { offset, limit, startAt, endAt, action } } =  data
    return request.get(`/soda/chipcard-bills?mobile=${mobile}&limit=${limit || 10 }&offset=${offset || 0}&startAt=${startAt || ''}&endAt=${endAt || ''}&action=${action || ''}`)
  },
  bonus: (mobile) => {
    return request.get(`/soda/bonus/${mobile}`)
  },
  bonusBillsList: (data) => {
    const { mobile, url: { offset, limit, startAt, endAt, action, type } } = data
    return request.get(`/soda/bonus-bills?mobile=${mobile}&limit=${limit || 10 }&offset=${offset || 0}&startAt=${startAt || ''}&endAt=${endAt || ''}&action=${action || ''}&type=${type || ''}`)
  },
  userDetail: (mobile) => {
    return request.get(`/soda/users/${mobile}`)
  },
  updatePassword: (mobile,data) => {
    return request.put(`/soda/users/${mobile}/password`,data)
  },
  resetWallet: (mobile) => {
    return request.put(`/soda/wallets/${mobile}/reset`)
  },
  resetBonus: (mobile) => {
    return request.put(`/soda/bonus/${mobile}/reset`)
  },
}
export default sodaService
