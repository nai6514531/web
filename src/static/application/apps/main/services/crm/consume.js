import request from '../../utils/request'
const consumeService = {
  list: (data) => {
    let url = `/consumptions?offset=${data.offset || 0 }&limit=${data.limit || 10 }&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}&customerMobile=${data.customerMobile || ''}`
    return request.get(url)
  },
  export: (data) => {
    let url = `/consumptions/excel/export?&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}&customerMobile=${data.customerMobile || ''}`
    return request.get(url)
  },
  refund: (id) => {
    return request.put(`/consumptions/${id}`)
  },
}
export default consumeService
