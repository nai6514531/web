import request from '../../utils/request'
const addressesService = {
  provinceList: () => {
    return request.get(`/addresses/provinces`)
  },
  provinceAdd: (data) => {
    return request.post(`/addresses/provinces`, data)
  },
  provinceUpdate: (id, data) => {
    return request.put(`/addresses/provinces/${id}`, data)
  },
  provinceDetail: (id) => {
    return request.get(`/addresses/provinces/${id}`)
  },
  provinceDelete: (id) => {
    return request.delete(`/addresses/provinces/${id}`)
  },
  cityList: (data, getAll) => {
    let url
    if(getAll) {
      url= `/addresses/cities?provinceCode=${data.provinceCode || ''}&name=${data.name || ''}`
    } else {
      url = `/addresses/cities?offset=${data.offset || 0 }&limit=${data.limit || 10 }&provinceCode=${data.provinceCode || ''}&name=${data.name || ''}`
    }
    return request.get(url)
  },

  cityAdd: (data) => {
    return request.post(`/addresses/cities`, data)
  },
  cityUpdate: (id, data) => {
    return request.put(`/addresses/cities/${id}`, data)
  },
  cityDetail: (id) => {
    return request.get(`/addresses/cities/${id}`)
  },
  cityDelete: (id) => {
    return request.delete(`/addresses/cities/${id}`)
  },
  areaList: (data,getAll) => {
    let url
    if(getAll) {
      url= `/addresses/areas?cityCode=${data.cityCode || ''}&name=${data.name || ''}`
    } else {
      url = `/addresses/areas?offset=${data.offset || 0 }&limit=${data.limit || 10 }&cityCode=${data.cityCode || ''}&name=${data.name || ''}`
    }
    return request.get(url)
  },
  areaAdd: (data) => {
    return request.post(`/addresses/areas`, data)
  },
  areaUpdate: (id, data) => {
    return request.put(`/addresses/areas/${id}`, data)
  },
  areaDetail: (id) => {
    return request.get(`/addresses/areas/${id}`)
  },
  areaDelete: (id) => {
    return request.delete(`/addresses/areas/${id}`)
  },
  streetList: (data, getAll) => {
    let url
    if(getAll) {
      url= `/addresses/streets?areaCode=${data.areaCode || ''}&name=${data.name || ''}`
    } else {
      url = `/addresses/streets?offset=${data.offset || 0 }&limit=${data.limit || 10 }&areaCode=${data.areaCode || ''}&name=${data.name || ''}`
    }
    return request.get(url)
  },
  streetAdd: (data) => {
    return request.post(`/addresses/streets`, data)
  },
  streetUpdate: (id, data) => {
    return request.put(`/addresses/streets/${id}`, data)
  },
  streetDetail: (id) => {
    return request.get(`/addresses/streets/${id}`)
  },
  streetDelete: (id) => {
    return request.delete(`/addresses/streets/${id}`)
  },
  schoolList: (data) => {
    return request.get(`/addresses/schools?offset=${data.offset || 0 }&limit=${data.limit || 10 }&provinceCode=${data.provinceCode || ''}&cityCode=${data.cityCode || ''}&areaCode=${data.areaCode || ''}&name=${data.name || ''}`)
  },
  schoolAdd: (data) => {
    return request.post(`/addresses/schools`, data)
  },
  schoolUpdate: (id, data) => {
    return request.put(`/addresses/schools/${id}`, data)
  },
  schoolDetail: (id) => {
    return request.get(`/addresses/schools/${id}`)
  },
  schoolDelete: (id) => {
    return request.delete(`/addresses/schools/${id}`)
  },

}

export default addressesService
