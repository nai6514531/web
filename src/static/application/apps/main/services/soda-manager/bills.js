import request from '../../utils/request'

const billsService = {
  list: (options) => {
    return request.get(`/mng/bills`, {
    	params: options
    })
  },
  getDetail: (id) => {
    return request.get(`/mng/bills/${id}/detail`)
  },
  getCast: (id) => {
    return request.get(`/mng/bills/${id}/cast`)
  },
  create: (id) => {
    return request.post(`/mng/bills`, {
      id: id || ''
    })
  },
  update: (id) => {
    return request.put(`/mng/bills/${id}`)
  },
  export: (options) => {
    return request.post(`/mng/bills/actions/export`, {
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
