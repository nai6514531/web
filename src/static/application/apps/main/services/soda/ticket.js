import request from '../../utils/request'
const ticketService = {
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
  ticketDetail: (id) => {
    let url = `/soda/tickets/${id}`
    return request.get(url)
  },
  drinkingRefund: (id) => {
    return request.post(`/soda/drinking-tickets/${id}/refund`)
  },
  drinkingExport: (data) => {
    return request.get(`/soda/consumptions/drinking-tickets/excel/export`, { params: data })
  },
  drinkingTicketsList: (data) => {
    return request.get(`/soda/drinking-tickets`, { params: data })
  },
  drinkingTicketDetail: (id) => {
    let url = `/soda/drinking-tickets/${id}`
    return request.get(url)
  }
}
export default ticketService
