import request from '../../utils/request'

const chipcardService = {
  list: (options) => {
    return request.get(`/soda/chipcard/recharges`, {
    	params: options
    })
  },
  getDetail: (options) => {
    return request.get(`/soda/chipcard/detail`, {
      params: options
    })
  },
  update: (options) => {
    return request.put(`/soda/chipcard/${options.chipcardId}`, {
      apply: options.apply
    })
  },
  recharge: (options) => {
    return request.put(`/soda/recharges/chipcard`, options)
  }
}
export default chipcardService
