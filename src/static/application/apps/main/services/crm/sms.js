import request from '../../utils/request'
const smsService = {
  list: (data) => {
    let date = data.date ? data.date.replace(/-/g,'') : ''
    let url = `/crm/sms/${ data.mobile }?offset=${data.offset || 0 }&limit=${data.limit || 10 }&date=${ date }`
    return request.get(url)
  }
}
export default smsService
