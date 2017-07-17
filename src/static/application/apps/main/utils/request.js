import axios from 'axios'
import NProgress from 'nprogress'
import { Modal, message } from 'antd'
import { API_SERVER } from './config'
import storage from './storage.js'
const confirm = Modal.confirm

const api = axios.create({
  baseURL: API_SERVER,
  headers: {
    'Content-Type': 'application/json',
    'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest',
    'Authorization': 'Bearer '+ storage.val('token') || ''
  },
  withCredentials: true,
  timeout: 1000 * 60 * 5,
  transformRequest: [(data) => {
    NProgress.start()
    if (!data) {
      return ''
    }
    return JSON.stringify(data)
  }],
  transformResponse: [(data) => {
    NProgress.done()
    try {
      data = JSON.parse(data)
    } catch (e) {
      return Promise.reject(e)
    }
    if (data) {
      // redo!!!
      // if (parseInt(data.status) < 0) {
      //   data.status = parseInt(data.status)
      //   if (data.status == -1) {
      //     confirm({
      //       title: data.msg,
      //       onOk() {
      //         window.location.href = '/'
      //       },
      //     })
      //   } else {
      //     message.error(data.msg, 3)
      //   }
      // } else {
      //   data.status = parseInt(data.status.substr(-2))
      //   return data
      // }
      return data
    } else {
    }
  }]
})

api.interceptors.request.use(function (config) {
  var timestamp = new Date().getTime()
  if (config.url.indexOf('?') > 0) {
    config.url = config.url + `&_t=${timestamp}`
  } else {
    config.url = config.url + `?_t=${timestamp}`
  }
  return config
})

api.interceptors.response.use(
  // redo!!!
  (response)=> {
    if (!response.data) {
      // return Promise.reject('服务器返回数据异常!')
    }
    return response.data
  },
  (error) => {
    if (error.response) {
      message.error(error.response.status,' 系统开小差了,请重试!', 3)
      console.error(error.response.status,error.response.data)
    } else {
      message.error('系统开小差了,请重试!', 3)
      console.error('Error', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
