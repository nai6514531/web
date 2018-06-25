import request from '../../utils/request'
const statisticsService = {
  listByDates: (data) => {
    let url = `/soda/statistics/tickets/dates?&limit=${data.limit || 10 }&offset=${data.offset || 0}&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&deviceSerial=${data.deviceSerial || ''}&status=${data.status}&period=${data.period}`
    return request.get(url)
  },
  listByDevices: (data) => {
    let url = `/soda/statistics/tickets/devices?&limit=${data.limit || 10 }&offset=${data.offset || 0}&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&deviceSerial=${data.deviceSerial || ''}&status=${data.status}`
    return request.get(url)
  },
  drinkingListByDates: (data) => {
    let url = `/soda/statistics/drinking-tickets/dates?&limit=${data.limit || 10 }&offset=${data.offset || 0}&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&deviceSerial=${data.deviceSerial || ''}&status=${data.status}&period=${data.period}`
    return request.get(url)
  },
  drinkingListByDevices: (data) => {
    let url = `/soda/statistics/drinking-tickets/devices?&limit=${data.limit || 10 }&offset=${data.offset || 0}&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&deviceSerial=${data.deviceSerial || ''}&status=${data.status}`
    return request.get(url)
  }
}
export default statisticsService
