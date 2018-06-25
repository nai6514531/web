import request from '../../utils/request'
const statisticsService = {
  listByMonth: (data) => {
    let url = `/mng/statistics/consumptions/monthly?&limit=${data.limit || 10 }&offset=${data.offset || 0}`
    return request.get(url)
  },
  listByDay: (data) => {
    let url = `/mng/statistics/consumptions/daily?&limit=${data.limit || 10 }&offset=${data.offset || 0}&startAt=${data.startAt}&endAt=${data.endAt}`
    return request.get(url)
  },
  operationlistByMonth: (data) => {
    let url = `/mng/statistics/operations/monthly?&limit=${data.limit || 10 }&offset=${data.offset || 0}`
    return request.get(url)
  },
  operationlistByDay: (data) => {
    let url = `/mng/statistics/operations/daily?limit=${data.limit || 10 }&offset=${data.offset || 0}&startAt=${data.startAt}&endAt=${data.endAt}`
    return request.get(url)
  },
  drinkingListByMonth: (data) => {
    let url = `/mng/statistics/drinking-consumptions/monthly?&limit=${data.limit || 10 }&offset=${data.offset || 0}`
    return request.get(url)
  },
  drinkingListByDay: (data) => {
    let url = `/mng/statistics/drinking-consumptions/daily?&limit=${data.limit || 10 }&offset=${data.offset || 0}&startAt=${data.startAt}&endAt=${data.endAt}`
    return request.get(url)
  }
}
export default statisticsService
