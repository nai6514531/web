import request from '../../utils/request'

const settlementService = {
  pay: (data) => {
    return request.post(`/mng/settlement/actions/pay`, {
    	bills: data
    })
  },
  get: (data) => {
    return request.get(`/mng/settlement`, {
    	params: data
    })
  },
  getDetail: (data) => {
    return request.get(`/mng/settlement/detail`)
  },
  export: (options) => {
    return request.post(`/mng/settlement/actions/export`, {
      endAt: options.endAt,
      startAt: options.startAt,
    })
  }
}
export default settlementService
