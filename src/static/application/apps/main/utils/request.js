import axios from 'axios'
import NProgress from 'nprogress'
import { Modal, message } from 'antd'
import { API_SERVER } from './debug'
import { storage, session } from './storage.js'
import 'nprogress/nprogress.css'

const confirm = Modal.confirm
const api = axios.create({
  baseURL: API_SERVER,
  headers: {
    'Content-Type': 'application/json',
    'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'
  },
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
    return data
  }]
})

api.interceptors.request.use(function (config) {
  config.headers.Authorization = 'Bearer ' + (storage.val('token') || '')
  config.withCredentials = !!~config.url.indexOf('http') ? false : true
  var timestamp = new Date().getTime()
  if (config.url.indexOf('?') > 0) {
    config.url = config.url + `&_t=${timestamp}`
  } else {
    config.url = config.url + `?_t=${timestamp}`
  }
  return config
})

api.interceptors.response.use(
  (response)=> {
    if (!response.data) {
      return Promise.reject('服务器返回数据异常!')
    }
    if(response.data.status === 'UNAUTHORIZED' || response.data.status === 'SESSION_EXPIRED') {
      storage.clear('token')
      session.clear()
      confirm({
        title: response.data.message,
        onOk() {
          window.location.href = '/'
        }
      })
      return Promise.reject(response.data)
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
