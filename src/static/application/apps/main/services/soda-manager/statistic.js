import request from '../../utils/request'
const statisticsService = {
  listByMonth: (data) => {
    let url = `/mng/statistics/consumptions/monthly?&limit=${data.limit || 10 }&offset=${data.offset || 0}&userId=${data.userId}`
    return request.get(url)
  },
  listByDay: (data) => {
    let url = `/mng/statistics/consumptions/daily?&limit=${data.limit || 10 }&offset=${data.offset || 0}&userId=${data.userId}&startAt=${data.startAt}&endAt=${data.endAt}`
    return request.get(url)
  }
}
export default statisticsService
