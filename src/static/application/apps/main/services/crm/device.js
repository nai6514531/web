import request from '../../utils/request'
const deviceService = {
  list: (data) => {
    let url = `/devices?offset=${data.offset || 0 }&limit=${data.limit || 10 }&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}`
    return request.get(url)
  },
  remove: (id) => {
    let url = `/devices/batch/remove`
    return request.put(url, id)
  },
  status: (id, data) => {
    let url = `/devices/${id}/status`
    return request.post(url, data)
  }
}
export default deviceService
