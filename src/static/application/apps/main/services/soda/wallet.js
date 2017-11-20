import request from '../../utils/request'

const walletService = {
  getTotalValue: (options) => {
    return request.get(`/wallet/total-value`)
  },
  resetValue: (mobile) => {
    return request.get(`/crm/wallet/${mobile}/actions/reset`)
  }
}
export default walletService
