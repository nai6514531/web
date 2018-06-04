import request from '../../utils/request'

const walletService = {
  getTotalValue: (options) => {
    return request.get(`/mng/wallet/total-value`)
  },
  resetValue: (mobile) => {
    return request.put(`/soda/wallets/${mobile}/reset`)
  },
  walletlogList: (data) => {
    const { mobile, offset, limit } = data
    return request.get(`/soda/walletlog?mobile=${mobile}&offset=${offset || 0}&limit=${limit || 10}`)
  }
}
export default walletService
