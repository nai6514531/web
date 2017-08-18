import request from '../utils/request'

const settlementService = {
  pay: (data) => {
    return request.post(`/settlement/actions/pay`, {
    	bills: data
    })
  }
}
export default settlementService
