import request from '../../utils/request'

const businessService = {
  createKey: (options) => {
    return request.post(`/wechat/business/key`, options)
  },
  getKeyDetail: (key) => {
    return request.get(`/wechat/business/key/${key}`)
  }
}

export default businessService
