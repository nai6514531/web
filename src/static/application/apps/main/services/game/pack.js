import request from '../../utils/request'
const packService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/game/packs`
    } else {
      url = `/game/packs?offset=${data.offset || 0 }&limit=${data.limit || 10 }&gameId=${data.gameId || ''}&status=${data.status || ''}&startedAt=${data.startedAt || ''}&endedAt=${data.endedAt || ''}&orderBy=${data.orderBy || 'created_at'}&asc=${data.asc || 0}`    
    }
    return request.get(url)
  },
  detail: (id) => {
    return request.get(`/game/pack/${id}`)
  },
  add: (data) => {
    let url = `/game/pack`
    return request.post(url, data)
  },
  update: (id, data) => {
    let url = `/game/pack/${id}`
    return request.put(url, data)
  },
  order: (data) => {
    return request.put(`/game/packs/orders`, data)
  },
  export: (data) => {
    let url
    if(!data) {
      url = `/game/packs/export`
    } else {
      url = `/game/packs/export?offset=${data.offset || 0 }&limit=${data.limit || 10 }&gameId=${data.gameId || ''}&status=${data.status || ''}&startedAt=${data.startedAt || ''}&endedAt=${data.endedAt || ''}&orderBy=${data.orderBy || 'created_at'}&asc=${data.asc || 0}`          
    }
    return request.get(url)
  },
  import: (data) => {
    return request.put(`/game/packs/import`, data)
  },
}
export default packService
