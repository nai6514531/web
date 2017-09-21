import request from '../utils/request'

const settlementService = {
  pay: (data) => {
    return request.post(`/settlement/actions/pay`, {
    	bills: data
    })
  },
  get: (data) => {
    return request.get(`/settlement`, {
    	params: data
    })
  },
  export: (options) => {
    return request.post(`/settlement/actions/export`, {
      endAt: options.endAt,
      startAt: options.startAt,
    })
  }
}
export default settlementService
