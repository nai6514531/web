import request from '../../utils/request'

const holdAuthService = {
  status: (id) => {
    return request.get(`/soda/auth-hold/${id}/status`)
  },
  releaseStatus: (options) => {
    return request.post(`/soda/auth-hold/actions/release-status`, options)
  },
}
export default holdAuthService
