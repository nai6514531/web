import axios from 'axios'
import NProgress from 'nprogress'
import { Modal, message } from 'antd'
import { API_SERVER } from './debug'
import { storage, session } from './storage.js'
import 'nprogress/nprogress.css'

const confirm = Modal.confirm
const api = axios.create({
  baseURL: API_SERVER,
  withCredentials: true,
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
  let token = storage.val('token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  let timestamp = new Date().getTime()
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
    return response.data
  },
  (error) => {
    if (error.response && error.response.data) {
      let data=error.response.data.data
      if (data&&data.status === 'UNAUTHORIZED') {
        storage.clear('token')
        session.clear()
        return confirm({
          title: data.message,
          onOk() {
            window.location.href = '/'
          }
        })
      }
    }
    message.error('系统开小差了,请重试!', 3)
    console.error('Error：', error)
    return Promise.reject(error)
  }
)
export default api
