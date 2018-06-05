import request from '../../utils/request'

const deviceService = {
  // 接口存在问题
  // list: (data) => {
  //   let url
  //   if(data.userId) {
  //     url= `/mng/devices?limit=1&userId=${data.userId || ''}`
  //   } else {
  //     url= `/mng/devices?offset=${data.offset || 0 }&limit=${data.limit || 10 }&keywords=${data.keywords || ''}&deviceSerial=${data.deviceSerial || ''}`
  //   }
  //   return request.get(url)
  // },
  list: (options) => {
    return request.get(`/mng/devices`, { params: options })
  },
  adminlist: (options) => {
    return request.get(`/mng/admin/devices`, { params: options })
  },
  detail:(serial) => {
    return request.get(`/mng/devices/${serial}`)
  },
  operations: (data) => {
    let url = `/mng/devices-operations?offset=${data.offset || 0 }&limit=${data.limit || 10}&type=${data.type || ''}&serialNumber=${data.serialNumber}`
    return request.get(url)
  },
  reset: (options) => {
    return request.put(`/mng/devices/actions/reset`, options)
  },
  resetToken: (options) => {
    let url = `/mng/devices/actions/reset-token`
    return request.patch(url,options)
  },
  // tiaozeng
  lock: (options) => {
    return request.patch(`/mng/devices/actions/lock`, options)
  },
  // tiaozeng
  unlock: (options) => {
    return request.patch(`/mng/devices/actions/unlock`, options)
  },
  update: (options) => {
    return request.put('/mng/devices', options)
  },
  add: (options) => {
    return request.post('/mng/devices', options)
  },
  // 分配设备
  assigned: (options) => {
    return request.post('/mng/devices/actions/assigned', options)
  },
  deleteDevice: (id) => {
    return request.delete(`/mng/devices/${id}`)
  },
  deviceType: (options) => {
    return request.get(`/mng/devices-types`, { params: options })
  },
  log: (options) => {
    return request.get(`/mng/devices-log`, { params: options })
  },
  status: (options) => {
    return request.get(`/mng/device/${options.deviceType}/status`)
  },
  deviceModeList: (options) => {
    return request.get(`/mng/devices-modes`, { params: options })
  }
}
export default deviceService
