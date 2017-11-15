import request from '../../utils/request'

const walletService = {
  getTotalValue: (options) => {
    return request.get(`/wallet/total-value`, {
    	params: options
    })
  }
}
export default walletService
