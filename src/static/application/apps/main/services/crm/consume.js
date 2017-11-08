import request from '../../utils/request'
const consumeService = {
  export: (data) => {
    let url = `/crm/excel/export?&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}&customerMobile=${data.customerMobile || ''}&userId=${data.userId || ''}`
    return request.get(url)
  },
  refund: (id) => {
    return request.post(`/crm/consumptions/${id}/refund`)
  },
}
export default consumeService
