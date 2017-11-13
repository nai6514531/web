import request from '../../utils/request'
const commonService = {
  consumptionsList: (data) => {
    let url = `/tickets?offset=${data.offset || 0 }&limit=${data.limit || 10 }&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}&customerMobile=${data.customerMobile || ''}&ownerId=${data.userId || ''}&status=${data.status || ''}`
    return request.get(url)
  },
  cashAccount: (data) => {
    return request.get(`/cash-accounts/${data.userId}`)
  }
}
export default commonService
