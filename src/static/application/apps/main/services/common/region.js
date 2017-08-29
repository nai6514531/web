import request from '../../utils/request'
const regionService = {
  province: (data) => {
    return request.get('/regions/provinces')
  }
}
export default regionService
