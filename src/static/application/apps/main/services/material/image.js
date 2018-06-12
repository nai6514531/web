import request from '../../utils/request'
const imageService = {
  list: (options) => {
    return request.get(`/mng/images`, {
    	params: options
    })
  },
  add: (data) => {
    return request.post(`/mng/images`,data)
  },
  update: (id, data) => {
    return request.put(`/mng/images/${id}`,data)
  },
  delete: (id) => {
    return request.delete(`/mng/images/${id}`)
  },
}
export default imageService
