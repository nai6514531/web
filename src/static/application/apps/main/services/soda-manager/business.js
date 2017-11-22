import request from '../../utils/request'

const businessService = {
  createKey: (options) => {
    return request.post(`/mng/business/wechat/create/key`, options)
  },
  getKeyDetail: (key) => {
    return request.get(`/mng/business/wechat/key/${key}`)
  }
}

export default businessService
