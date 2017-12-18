import request from '../../utils/request'

const deviceAddressService = {
  list: (options) => {
    return request.get(`/mng/devices-service-addresses`, { params: options })
  },
  detail: (id) => {
    return request.get(`/mng/devices-service-addresses/${id}`)
  },
  cancel: (id) => {
    return request.delete(`/mng/devices-service-addresses/${id}`)
  },
  update: (options) => {
    return request.put(`/mng/devices-service-addresses`, options)
  },
  add: (options) => {
    return request.post(`/mng/devices-service-addresses`, options)
  },
 
}
export default deviceAddressService
