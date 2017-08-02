import request from '../../utils/request'
const roleService = {
  list: () => {
    return request.get(`/roles`)
  }
}
export default roleService
