import request from '../../utils/request'
const addressesService = {
  provinceList: () => {
    return request.get(`/mng/provinces`)
  },
  provinceAdd: (data) => {
    return request.post(`/mng/provinces`, data)
  },
  provinceUpdate: (id, data) => {
    return request.put(`/mng/provinces/${id}`, data)
  },
  provinceDetail: (id) => {
    return request.get(`/mng/provinces/${id}`)
  },
  provinceDelete: (id) => {
    return request.delete(`/mng/provinces/${id}`)
  },
  cityList: (data, getAll) => {
    return request.get(`/mng/cities`, { params: data})
  },
  cityAdd: (data) => {
    return request.post(`/mng/cities`, data)
  },
  cityUpdate: (id, data) => {
    return request.put(`/mng/cities/${id}`, data)
  },
  cityDetail: (id) => {
    return request.get(`/mng/cities/${id}`)
  },
  cityDelete: (id) => {
    return request.delete(`/mng/cities/${id}`)
  },
  districtList: (data,getAll) => {
    let url
    if(getAll) {
      url= `/mng/districts?cityId=${data.cityId || ''}&name=${data.name || ''}`
    } else {
      url = `/mng/districts?offset=${data.offset || 0 }&limit=${data.limit || 10 }&cityId=${data.cityId || ''}&name=${data.name || ''}`
    }
    return request.get(url)
  },
  districtAdd: (data) => {
    return request.post(`/mng/districts`, data)
  },
  districtUpdate: (id, data) => {
    return request.put(`/mng/districts/${id}`, data)
  },
  districtDetail: (id) => {
    return request.get(`/mng/districts/${id}`)
  },
  districtDelete: (id) => {
    return request.delete(`/mng/districts/${id}`)
  },
  streetList: (data, getAll) => {
    let url
    if(getAll) {
      url= `/mng/streets?districtId=${data.districtId || ''}&name=${data.name || ''}`
    } else {
      url = `/mng/streets?offset=${data.offset || 0 }&limit=${data.limit || 10 }&districtId=${data.districtId || ''}&name=${data.name || ''}`
    }
    return request.get(url)
  },
  streetAdd: (data) => {
    return request.post(`/mng/streets`, data)
  },
  streetUpdate: (id, data) => {
    return request.put(`/mng/streets/${id}`, data)
  },
  streetDetail: (id) => {
    return request.get(`/mng/streets/${id}`)
  },
  streetDelete: (id) => {
    return request.delete(`/mng/streets/${id}`)
  },
  schoolList: (options) => {
    // 不分页
    if (!options.limit) {
      return request.get(`/mng/schools`, {
        params: options
      })
    }
    return request.get(`/mng/schools?offset=${options.offset || 0 }&limit=${options.limit || 10 }`, {
      params: options
    })
  },
  schoolAdd: (data) => {
    return request.post(`/mng/schools`, data)
  },
  schoolUpdate: (id, data) => {
    return request.put(`/mng/schools/${id}`, data)
  },
  schoolDetail: (id) => {
    return request.get(`/mng/schools/${id}`)
  },
  schoolDelete: (id) => {
    return request.delete(`/mng/schools/${id}`)
  },

}

export default addressesService
