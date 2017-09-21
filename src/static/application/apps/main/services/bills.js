import request from '../utils/request'

const billsService = {
  get: (data) => {
    return request.get(`/bills`, {
    	params: data
    })
  },
  getDetail: (options) => {
    return request.get(`/bills/${options.id}`, {
    	params: options
    })
  },
  export: (options) => {
    return request.post(`/bills/actions/export`, {
      dateType: parseInt(options.dateType, 10),
      endAt: options.endAt,
      keys: options.keys,
      startAt: options.startAt,
      status: parseInt(options.status, 10),
      type: parseInt(options.type, 10),
    })
  }
}
export default billsService
