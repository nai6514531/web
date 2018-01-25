import request from '../../utils/request'
const deviceService = {
  list: (data) => {
    let url
    if(data.userId) {
      url= `/mng/devices?limit=1&userId=${data.userId || ''}`
    } else {
      url= `/mng/devices?offset=${data.offset || 0 }&limit=${data.limit || 10 }&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}`
    }
    return request.get(url)
  },
  detail:(deviceSerial) => {
    return request.get(`/mng/devices/${deviceSerial}`)
  },
  operations: (data) => {
    let url = `/mng/devices-operations?offset=${data.offset || 0 }&limit=${data.limit || 10}&type=${data.type || ''}&serialNumber=${data.serialNumber}`
    return request.get(url)
  },
  reset: (idList) => {
    let url = `/mng/devices/actions/reset`
    return request.put(url, idList)
  },
  resetToken: (serialNumber) => {
    let url = `/mng/devices/${serialNumber}/token`
    return request.put(url)
  },
  status: (id, data) => {
    let url = `/mng/devices/${id}/status`
    return request.post(url, data)
  }
}
export default deviceService
