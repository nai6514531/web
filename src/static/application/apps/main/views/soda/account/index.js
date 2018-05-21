import React, {  Component }from 'react'
import { connect } from 'dva'
import Promise from 'bluebird'
import _ from 'underscore'
import moment from 'moment'
import op from 'object-path'
import cx from 'classnames'
import querystring from 'querystring'
import { Link } from 'react-router-dom'
import { Table, Button, message } from 'antd'

import { InputClear } from '../../../components/form/input'
import UserService from '../../../services/soda-manager/user'
import ChipcardService from '../../../services/soda-manager/chipcard'
import history from '../../../utils/history'

import Breadcrumb from '../../../components/layout/breadcrumb'

import styles from './index.pcss'

const PAEG_SIZE = 10

const breadItems = [
  {
    title: '账号管理',
  },
  {
    title: '下级运营商'
  }
]

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      search: {
        name: '',
        contact: ''
      },
      loading: false,
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
      {
        title: '操作',
        render: (text, record) => {
          let { location: { pathname } } = this.props
          return <Link to={`${pathname.replace('/sub', '')}/edit/${record.id}?isSub=true`}>修改</Link>
        }
      }
    ]
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let search = _.pick(query, 'name', 'contact')
    let pagination = _.pick(query, 'limit', 'offset')

    this.list({ search , pagination})
  }
  list({...options}) {
    let search = options.search || {}
    let pagination = options.pagination || {}
    search = {...this.state.search, ...search}
    pagination = {...this.state.pagination, ...pagination}
    this.setState({ loading: true, search, pagination })

    UserService.list({ type: 0, ...search, ..._.pick(pagination, 'limit', 'offset') }).then((res) => {
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
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  changeHistory (options) {
    let { location: { pathname } } = this.props
    let query = _.pick({...this.state.search, ...this.state.pagination, ...this.state, ...options}, 'name', 'contact', 'limit', 'offset')
    this.props.history.push(`/${pathname}?${querystring.stringify(query)}`)
  }
  search() {
    let pagination = { offset: 0 }
    this.changeHistory(pagination)
    this.list({ pagination })
  }
  changeKeys (key, e) {
    const val = e.target.value || ''
    this.setState({ search: {...this.state.search, [`${key}`]: val.replace(/(^\s+)|(\s+$)/g,"") } })
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
    let { list, loading, search: { name, contact } } = this.state
    let { location: { pathname } } = this.props
    pathname = pathname.split('/')[1]

    return (<div>
      <Breadcrumb items={breadItems} location={this.props.location} />
      <div>
        <Button
          type='primary'　
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={() => {  this.props.history.push(`/${pathname}/account/add`) }}>
          添加新运营商
        </Button>
        <InputClear
          value={name}
          style={{ width: 160, marginRight: 10, marginBottom: 10 }}
          placeholder='输入运营商名'
          onChange={this.changeKeys.bind(this, 'name')}
          onPressEnter={this.search.bind(this)}
        />
        <InputClear
          value={contact}
          style={{ width: 160, marginRight: 10, marginBottom: 10 }}
          placeholder='输入联系人'
          onChange={this.changeKeys.bind(this, 'contact')}
          onPressEnter={this.search.bind(this)}
        />
        <Button type='primary' loading={loading} onClick={this.search.bind(this)}>筛选</Button>
      </div>
      <Table
        scroll={{ x: 980 }}
        style= {{ marginTop: 16 }}
        columns={this.columns}
        rowKey={record => record.id}
        dataSource={list}
        pagination={this.pagination.call(this)}
        loading={loading}
      />
    </div>)
  }
}

function mapStateToProps(state,props) {
  return {
    user: state.common.userInfo.user,
    ...props
  }
}
export default connect(mapStateToProps)(App)
