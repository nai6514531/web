import request from '../../utils/request'
const billboardService = {
  list: () => {
    let url
    url = `/game/billboards`
    return request.get(url)
  },
  detail: (id) => {
    return request.get(`/game/billboard/${id}`)
  },
  add: (data) => {
    let url = `/game/billboard`
    return request.post(url, data)
  },
  update: (id, data) => {
    let url = `/game/billboard/${id}`
    return request.put(url, data)
  },
  delete: (id) => {
    return request.delete(`/game/billboard/${id}`)
  },
  gamesList: (id) => {
    let url
    url = `/game/billboard/${id}/games`
    return request.get(url)
  },
  deleteGame: (id, gameId) => {
    return request.delete(`/game/billboard/${id}/game/${gameId}`)
  },
  addGame: (id, gameId) => {
    let url = `/game/billboard/${id}/game/${gameId}`
    return request.post(url)
  },
  updateGameOrders: (id, data) => {
    let url = `/game/billboard/${id}/games/orders`
    return request.put(url, data)
  },
}
export default billboardService
