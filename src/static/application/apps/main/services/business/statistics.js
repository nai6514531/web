import request from '../../utils/request'
const statisticsService = {
  listByMonth: (data) => {
    let url = `/statistics/consumptions/monthly?&limit=${data.limit || 10 }&offset=${data.offset || 0}&userId=${data.userId}`
    return request.get(url)
  },
  listByDay: (data) => {
    let url = `/statistics/consumptions/daily?&limit=${data.limit || 10 }&offset=${data.offset || 0}&userId=${data.userId}&startAt=${data.startAt}&endAt=${data.endAt}`
    return request.get(url)
  },
  listByDates: (data) => {
    let url = `/statistics/tickets/dates?&limit=${data.limit || 10 }&offset=${data.offset || 0}&ownerId=${data.ownerId}&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&deviceSerial=${data.deviceSerial || ''}&status=${data.status}&period=${data.period}`
    return request.get(url)
  },
  listByDevices: (data) => {
    let url = `/statistics/tickets/devices?&limit=${data.limit || 10 }&offset=${data.offset || 0}&ownerId=${data.ownerId}&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&deviceSerial=${data.deviceSerial || ''}&status=${data.status}`
    return request.get(url)
  },
  refund: (id) => {
    return request.post(`/business/tickets/${id}/refund`)
  },
  export: (data) => {
    let url = `/business/consumptions/excel/export?&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}&customerMobile=${data.customerMobile || ''}&status=${data.status || ''}`
    return request.get(url)
  },
}
export default statisticsService
