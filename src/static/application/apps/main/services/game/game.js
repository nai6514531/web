import request from '../../utils/request'
const gameService = {
  list: (data) => {
    let url
    if(!data) {
      url = `/game/games`
    } else {
      url = `/game/games?offset=${data.offset || '' }&limit=${data.limit || '' }&id=${data.id || ''}&supplierId=${data.supplierId || ''}&status=${data.status || ''}&startedAt=${data.startedAt || ''}&endedAt=${data.endedAt || ''}&orderBy=${data.orderBy || 'created_at'}&asc=${data.asc || 0}`    
    }
    return request.get(url)
  },
  detail: (id) => {
    return request.get(`/game/game/${id}`)
  },
  add: (data) => {
    let url = `/game/game`
    return request.post(url, data)
  },
  update: (id, data) => {
    let url = `/game/game/${id}`
    return request.put(url, data)
  },
  export: (data) => {
    let url
    if(!data) {
      url = `/game/games/export`
    } else {
      url = `/game/games?offset=${data.offset || 0 }&limit=${data.limit || 10 }&id=${data.id || ''}&supplierId=${data.supplierId || ''}&status=${data.status || ''}&startedAt=${data.startedAt || ''}&endedAt=${data.endedAt || ''}&orderBy=${data.orderBy || 'created_at'}&asc=${data.asc || 0}`          
    }
    return request.get(url)
  },
  order: (data) => {
    return request.put(`/game/games/orders`, data)
  }
}
export default gameService
