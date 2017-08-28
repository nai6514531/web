import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import querystring from 'querystring'

import history from '../../../../utils/history'

import billsService from '../../../../services/bills'
import { Popconfirm, Button, Modal, Form, Select, Table, Input, Checkbox, Col, Row, DatePicker, message } from 'antd'
const { RangePicker } = DatePicker
const { Option } = Select

import Breadcrumb from '../../../../components/layout/breadcrumb/'
import styles from '../index.pcss'

const PAEG_SIZE = 10

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}
const wechatBreadItems = [
  {
    title: '财务系统'
  },
  {
    title: '结算管理',
  },
  {
    title: '微信结算',
    url: '/finance/settlement/wechat',
  },
  {
    title: '账单明细'
  }
]

const alipayBreadItems = [
  {
    title: '财务系统'
  },
  {
    title: '结算管理',
  },
  {
    title: '支付宝结算',
    url: '/finance/settlement/alipay',
  },
  {
    title: '账单明细'
  }
]
const BILLS_STATUS = {1:'等待结算', 2:'结算成功', 3:'结算中', 4:'结算失败'}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bills: [],
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      },
      loading: false
    }
    this.columns = [
      {
        title: '账单号',
        dataIndex: 'id'
      },
      {
        title: '运营商',
        dataIndex: 'user',
        render: (user) => {
          return `${user.name}`
        }
      },
      {
        title: '金额',
        dataIndex: 'totalAmount',
        render: (totalAmount) => {
          return `${totalAmount/100}`
        }
      },
      {
        title: '收款方式',
        dataIndex: 'account',
        render: (account) => {
          return `${account.payName}`
        }
      },
      {
        title: '账期',
        dataIndex: 'billAt',
        render: (date) => {
          return moment(date).format('YYYY-MM-DD')
        }
      },
      {
        title: '帐户信息',
        dataIndex: 'account',
        key: 'account.id',
        render: (account, record) => {
          if (!!~[1].indexOf(account.type)) {
            return _.template([
              '<%- realName %>',
              '账号：<%- name %>',
              '手机号：<%- mobile %>'
              ].join(' | '))({
                realName: account.realName,
                name: account.name || '-',
                mobile: record.mobile || '-'
              })
          } 
          if (!!~[2].indexOf(account.type)) {
            return _.template([
              '<%- realName %>',
              ].join(' | '))({
                realName: account.realName,
                name: account.name || '-',
                mobile: record.mobile || '-'
              })
          } 
          return '-'
        }
      },
     
      {
        title: '订单量',
        dataIndex: 'count'
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (status) => {
          return BILLS_STATUS[status]
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          const type = !!~this.props.location.search.indexOf('alipay') ? 'alipay' : 
            !!~this.props.location.search.indexOf('wechat') ? 'wechat' : ''
          const id = this.props.match.params.id

          return (
            <Link to={`/finance/settlement/daily-bills/${record.id}?type=${type}&billId=${id}`}>明细</Link> 
          )
        }
      }
    ]
  }
  componentDidMount () {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    this.getBillsDetail({pagination: {limit: parseInt(query.limit || PAEG_SIZE, 10), offset: parseInt(query.offset || 0, 10)}})
  }
  getBillsDetail({...options}) {
    const pagination = _.extend(this.state.pagination, options.pagination || {})
    const id = this.props.match.params.id
    const search = _.extend({id: id }, pagination)

    this.setState({ loading: true })
    billsService.getDetail(search).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data
      this.setState({
        bills: data.objects, 
        pagination: {
          ...pagination,
          total: data.pagination.total,
        }, 
        loading: false
      })
    }).catch((err) => {
      this.setState({loading: false})
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  changeHistory (options) {
    let payType = !!~this.props.location.search.indexOf('alipay') ? 'alipay' : 
      !!~this.props.location.search.indexOf('wechat') ? 'wechat' : ''
    let pagination = _.clone(this.state.pagination)
    let id = this.props.match.params.id
    options = _.extend(pagination, options)
    options.type = payType

    let query = querystring.stringify(_.pick(options, 'offset', 'limit', 'type'))
    history.push(`/finance/settlement/bills/${id}?${query}`)
  }
  render () {
    const self = this
    const type = !!~this.props.location.search.indexOf('alipay') ? 1 : 
                  !!~this.props.location.search.indexOf('wechat') ? 2 : 0

    const pagination = {
      total: this.state.pagination.total,
      current: parseInt(this.state.pagination.offset / this.state.pagination.limit) + 1,
      pageSize: parseInt(this.state.pagination.limit, 10),
      showSizeChanger: true,

      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = {limit: pageSize, offset: offset}
        self.changeHistory(pagination)
        self.getBillsDetail({pagination: pagination})
      },
      onChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = {offset: offset}
        self.changeHistory(pagination)
        self.getBillsDetail({pagination: pagination})
      }
    }
    return(
      <div className={styles.view}>
        <Breadcrumb items={type === 1 ? alipayBreadItems : wechatBreadItems} />
        <Table
          dataSource={this.state.bills || []}
          rowKey={record => record.id}
          columns={this.columns}
          loading={this.state.loading}
          pagination={pagination}
          className={styles.table}
        />
      </div>
    )
  }
}

export default App
