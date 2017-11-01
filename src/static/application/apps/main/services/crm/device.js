import request from '../../utils/request'
const deviceService = {
  list: (data) => {
    let url
    if(data.userId) {
      url= `/crm/devices?limit=1&userId=${data.userId || ''}`
    } else {
      url= `/crm/devices?offset=${data.offset || 0 }&limit=${data.limit || 10 }&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}`
    }
    return request.get(url)
  },
  operations: (data) => {
    let url = `/crm/operations/devices?offset=${data.offset || 0 }&limit=${data.limit || 10}&type=${data.type}&serialNumber=${data.serialNumber}`
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
