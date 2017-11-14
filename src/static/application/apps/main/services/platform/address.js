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
      url= `/addresses/cities?provinceId=${data.provinceId || ''}&name=${data.name || ''}`
    } else {
      url = `/addresses/cities?offset=${data.offset || 0 }&limit=${data.limit || 10 }&provinceId=${data.provinceId || ''}&name=${data.name || ''}`
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
  districtList: (data,getAll) => {
    let url
    if(getAll) {
      url= `/addresses/districts?cityId=${data.cityId || ''}&name=${data.name || ''}`
    } else {
      url = `/addresses/districts?offset=${data.offset || 0 }&limit=${data.limit || 10 }&cityId=${data.cityId || ''}&name=${data.name || ''}`
    }
    return request.get(url)
  },
  districtAdd: (data) => {
    return request.post(`/addresses/districts`, data)
  },
  districtUpdate: (id, data) => {
    return request.put(`/addresses/districts/${id}`, data)
  },
  districtDetail: (id) => {
    return request.get(`/addresses/districts/${id}`)
  },
  districtDelete: (id) => {
    return request.delete(`/addresses/districts/${id}`)
  },
  streetList: (data, getAll) => {
    let url
    if(getAll) {
      url= `/addresses/streets?districtId=${data.districtId || ''}&name=${data.name || ''}`
    } else {
      url = `/addresses/streets?offset=${data.offset || 0 }&limit=${data.limit || 10 }&districtId=${data.districtId || ''}&name=${data.name || ''}`
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
    return request.get(`/addresses/schools?offset=${data.offset || 0 }&limit=${data.limit || 10 }&provinceId=${data.provinceId || ''}&cityId=${data.cityId || ''}&districtId=${data.districtId || ''}&name=${data.name || ''}`)
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
