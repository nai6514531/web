import request from '../utils/request'

const settlementService = {
  pay: (data) => {
    return request.post(`/api/settlement/actions/pay`, {
    	bills: data
    })
  }
}
export default settlementService
