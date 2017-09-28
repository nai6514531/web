import request from '../../utils/request'
const deviceService = {
  list: (data) => {
    let url = `/crm/devices?offset=${data.offset || 0 }&limit=${data.limit || 10 }&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}`
    return request.get(url)
  },
  reset: (id) => {
    let url = `/crm/devices/batch/reset`
    return request.put(url, id)
  },
  status: (id, data) => {
    let url = `/crm/devices/${id}/status`
    return request.post(url, data)
  }
}
export default deviceService
