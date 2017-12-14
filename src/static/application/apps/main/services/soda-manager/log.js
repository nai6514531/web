import request from '../../utils/request'
const logService = {
  loginList: (data) => {
    return request.get(`/mng/logs/login?offset=${data.offset || 0 }&limit=${data.limit || 10 }&userId=${data.userId || ''}&userName=${data.userName || ''}&userAccount=${data.userAccount || ''}`)
  },
  actionList: (data) => {
    return request.get(`/mng/logs/actions?offset=${data.offset || 0 }&limit=${data.limit || 10 }&userId=${data.userId || ''}&userName=${data.userName || ''}&userAccount=${data.userAccount || ''}&apiName=${data.apiName || ''}&startAt=${data.startAt || ''}&endAt=${data.endAt || ''}`)
  },
  actionDetail: (id) => {
    return request.get(`/mng/logs/actions/${id}`)
  },
}
export default logService
