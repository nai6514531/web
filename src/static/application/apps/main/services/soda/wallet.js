import request from '../../utils/request'

const walletService = {
  getTotalValue: (options) => {
    return request.get(`/mng/wallet/total-value`)
  },
  resetValue: (mobile) => {
    return request.put(`/soda/wallets/${mobile}/reset`)
  }
}
export default walletService
