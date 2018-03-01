import React, {  Component }from 'react'
import Promise from 'bluebird'
import _ from 'underscore'
import moment from 'moment'
import op from 'object-path'
import cx from 'classnames'
import querystring from 'querystring'
import { Link } from 'react-router-dom'
import { Table, Button, message } from 'antd';

import { InputClear } from '../../../components/form/input'
import UserService from '../../../services/soda-manager/user'
import ChipcardService from '../../../services/soda-manager/chipcard'
import history from '../../../utils/history'

import Breadcrumb from '../../../components/layout/breadcrumb'

import styles from './index.pcss'

const PAEG_SIZE = 10

const breadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '运营商管理'
  }
]

const subBreadItems = [
  {
    title: '苏打生活',
  },
  {
    title: '运营商管理',
    url: '/business/account'
  },
  {
    title: '下级运营商'
  }
]

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSubAccount: false,
      isPermissionRecharge: false,
      parentId: '',
      list: [],
      search: {
        keys: ''
      },
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      }
    }
    this.columns = [
      {
        title: '用户编号',
        dataIndex: 'id',
      }, {
        title: '运营商名称',
        dataIndex: 'name',
      }, {
        title: '联系人',
        dataIndex: 'contact',
      }, {
        title: '登录账号',
        dataIndex: 'account',
      }, {
        title: '地址',
        dataIndex: 'address',
      },
      // {
      //   title: '模块数量',
      //   render: (record) => {
      //     let count = op.get(record, 'device.count')
      //     return count
      //   }
      // },
      {
        title: '操作',
        render: (text, record) => {
          let { isSubAccount, parentId } = this.state

          if (isSubAccount) {
            return <Link to={`/business/account/edit/${record.id}?parentId=${parentId}`}>修改</Link>
          }
          return <Link to={`/business/account/edit/${record.id}`}>修改</Link>
        }
      }
    ]
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let search = _.pick(query, 'keys', 'parentId')
    let pagination = _.pick(query, 'limit', 'offset')
    let parentId = search.parentId || ''

    if (!!parentId) {
      this.setState({ isSubAccount: true, parentId })
      this.list({ search: { keys: search.keys, id: parentId } , pagination})
      return
    }
    this.detail()
    this.getisRechargePermission()
  }
  getisRechargePermission() {
    ChipcardService.getRechargePermission().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        isPermissionRecharge: data.value,
      })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  detail () {
    UserService.getDetailWithDevice().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        list: new Array(data),
        parentId: data.id,
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  list({...options}) {
    let search = options.search || {}
    let pagination = options.pagination || {}
    search = {...this.state.search, ...search}
    pagination = {...this.state.pagination, ...pagination}
    this.setState({ searchLoading: true, loading: true, search, pagination })

    UserService.list({ ...search, ...{ type: 0 }, ..._.pick(pagination, 'limit', 'offset') }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        list: data.objects || [],
        pagination: {
          ...pagination,
          total: data.pagination.total
        },
        searchLoading: false,
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false, searchLoading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  changeHistory (options) {
    let query = _.pick({...this.state.search, ...this.state.pagination, ...this.state, ...options}, 'keys', 'parentId',  'limit', 'offset')
    this.props.history.push(`/business/account?${querystring.stringify(query)}`)
  }
  search() {
    let pagination = { offset: 0 }
    this.changeHistory(pagination)
    this.list({ pagination })
  }
  changeKeys (e) {
    const val = e.target.value || ''
    this.setState({ search: {...this.state.search, keys: val.replace(/(^\s+)|(\s+$)/g,"") } })
  }
  toSubList () {
    let { parentId } = this.state
    this.props.history.push(`/business/account/sub?parentId=${parentId}`)
  }
  pagination () {
    let self = this
    let { pagination: { total, offset, limit } } = this.state
    return {
      total: total,
      current: parseInt(offset / limit) + 1,
      pageSize: parseInt(limit, 10),
      showSizeChanger: true,
      pageSizeOptions: ['10', '50', '100', '200'],
      showTotal (data) {
        return <span>总计 {data} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = { limit: pageSize, offset: offset }
        self.changeHistory(pagination)
        self.list({ pagination })
      },
      onChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = { offset: offset }
        self.changeHistory(pagination)
        self.list({ pagination })
      }
    }
  }
  render() {
    let { isSubAccount, isPermissionRecharge, list, searchLoading, loading, parentId, search: { keys } } = this.state

    return (<div>
      <Breadcrumb items={isSubAccount ? subBreadItems : breadItems} />
      {
        isSubAccount ? <div>
          <Button
            type='primary'　
            style={{ marginRight: 10, marginBottom: 10 }}
            disabled={!!parentId ? false : true}
            onClick={() => {  this.props.history.push(`/business/account/add?parentId=${parentId}`) }}>
            添加新运营商
          </Button>
          <InputClear
            value={keys}
            style={{ width: 160, marginRight: 10, marginBottom: 10 }}
            placeholder='输入运营商或联系人'
            onChange={this.changeKeys.bind(this)}
            onPressEnter={this.search.bind(this)}
          />
          <Button type='primary' loading={searchLoading} onClick={this.search.bind(this)}>筛选</Button>
        </div> : <div>
          <Button
            type='primary'　
            style={{ marginRight: 10, marginBottom: 10 }}
            disabled={!!parentId ? false : true}
            onClick={this.toSubList.bind(this)}>下级运营商</Button>
          {isPermissionRecharge ? <Button
            type='primary'
            style={{ backgroundColor: "#ED9D51", borderColor: "#ED9D51" }}
            onClick={() => { this.props.history.push('/business/recharges-chipcard') }}>
            IC卡金额转移
          </Button> : null }
        </div>
      }
      <Table
        scroll={{ x: 980 }}
        style= {{ marginTop: 16 }}
        columns={this.columns}
        rowKey={record => record.id}
        dataSource={list}
        pagination={isSubAccount ? this.pagination.call(this) : null}
        loading={loading}
      />
    </div>)
  }
}

export default App
