import request from '../../../utils/request'
const customerService = {
  list: (mobile) => {
    return request.get(`/crm/customers/${mobile}`)
  },
  updatePassword: (mobile,data) => {
    return request.put(`/crm/customers/${mobile}/password`,data)
  },
  billsList: (data) => {
    const { mobile, url: { offset, limit, startAt, endAt, action, type } } =  data
    return request.get(`/crm/bills?mobile=${mobile}&limit=${limit || 10 }&offset=${offset || 0}&startAt=${startAt || ''}&endAt=${endAt || ''}&action=${action || ''}&type=${type || ''}`)
  },
  chipcardBillsList: (data) => {
    const { mobile, url: { offset, limit, startAt, endAt, action } } =  data
    return request.get(`/crm/chipcard-bills?mobile=${mobile}&limit=${limit || 10 }&offset=${offset || 0}&startAt=${startAt || ''}&endAt=${endAt || ''}&action=${action || ''}`)
  },
}
export default customerService
