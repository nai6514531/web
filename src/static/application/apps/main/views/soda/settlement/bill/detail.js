import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import querystring from 'querystring'
import { Table, message } from 'antd'
import op from 'object-path'

import DailyBillsService from '../../../../services/soda-manager/daily-bills'

import history from '../../../../utils/history'
import { conversionUnit } from '../../../../utils/functions'

import Breadcrumb from '../../../../components/layout/breadcrumb'

import CASH_ACCOUNT from '../../../../constant/cash-account'
import TICKET from '../../../../constant/ticket'

import styles from './index.pcss'

const PAEG_SIZE = 10

const wechatBreadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '结算管理',
  },
  {
    title: '微信结算',
    url: '/soda/settlement/wechat',
  },
  {
    title: '账单明细',
    url: `/soda/settlement/bills/BILL_ID?type=wechat`,
  },
  {
    title: '明细'
  }
]

const alipayBreadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '结算管理',
  },
  {
    title: '支付宝结算',
    url: '/soda/settlement/alipay',
  },
  {
    title: '账单明细',
    url: `/soda/settlement/bills/BILL_ID?type=alipay`,
  },
  {
    title: '明细'
  }
]

class Bread extends Component {
  constructor(props) {
    super(props)
  }
  render () {
    let { billId } = querystring.parse(window.location.search) 
    let { type } = this.props
    let items = type === CASH_ACCOUNT.TYPE_IS_ALIPAY ? alipayBreadItems : wechatBreadItems

    items = _.map(items, (item) => {
      if (item.url) {
        let url = item.url.replace('BILL_ID', billId)
        return { title: item.title, url: url }
      }
      return item
    })

    return <Breadcrumb items={items} />
  }
}

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
        title: '设备编号/服务地点',
        dataIndex: 'device',
        render: (device) => {
          return `${device.serial || '-' } / ${device.address || '-'}`
        }
      },
      {
        title: '服务名',
        dataIndex: 'type',
        render: (type, record) => {
          let names = (op(record).get('snapshot.modes') || []).map((mode) => {
            return mode.name
          })
          return (names || []).join('/')
        }
      },
      {
        title: '金额',
        dataIndex: 'pay',
        key:'pay.amount',
        render: (pay) => {
          return `${conversionUnit(pay.amount)}元`
        }
      },
      {
        title: '支付方式',
        dataIndex: 'pay',
        render: (pay) => {
          return TICKET.PAYMENT_TYPE[pay.type] || '-'
        }
      },
      {
        title: '消费手机号',
        dataIndex: 'user',
        render: (user) => {
          return `${user.mobile}`
        }
      },
      {
        title: '下单时间',
        dataIndex: 'createdAt',
        render: (date) => {
          return moment(date).format('YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '订单状态',
        dataIndex: 'status',
        render: (status) => {
          switch (status) {
            case TICKET.STATUS_IS_DELIVERED:
              return <span>正常</span>
              break;
            case TICKET.DRINKING_STATUS_IS_SETTLED:
              return <span>正常</span>
              break;
            case TICKET.STATUS_IS_REFUND:
              return <span className={styles.refund}>已退款</span>
              break;
            default:
              return '-'
          }
        }
      },
      {
        title: '是否结算',
        dataIndex: 'hasSettled',
        render: (hasSettled) => {
          return hasSettled ? '是' : '否'
        }
      }
    ]
  }
  componentDidMount () {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = _.pick(querystring.parse(query), 'limit', 'offset') 

    this.getDailyBillsDetail({
      pagination: {
        limit: parseInt(query.limit || PAEG_SIZE, 10), 
        offset: parseInt(query.offset || 0, 10)
      }
    })
  }
  getDailyBillsDetail({ ...options }) {
    const pagination = _.extend(this.state.pagination, options.pagination || {})
    const id = this.props.match.params.id
    const search = _.extend({id: id}, pagination)
    this.setState({ loading: true })
    DailyBillsService.getTickets(search).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data
      this.setState({
        bills: data.objects, 
        pagination: {
          ...pagination,
          total: data.pagination.total
        }, 
        loading: false
      })
    }).catch((err) => {
      this.setState({loading: false})
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  changeHistory (options) {
    let { billId } = querystring.parse(window.location.search) 
    let payType = !!~this.props.location.search.indexOf('alipay') ? 'alipay' : 
      !!~this.props.location.search.indexOf('wechat') ? 'wechat' : ''
    let pagination = _.clone(this.state.pagination)
    let id = this.props.match.params.id
    options = _.extend(pagination, options)
    options.type = payType
    options.billId = billId

    let query = querystring.stringify(_.pick(options, 'offset', 'limit', 'type', 'billId'))
    history.push(`/soda/settlement/daily-bills/${id}?${query}`)
  }
  render () {
    const self = this
    const type = !!~this.props.location.search.indexOf('alipay') ? 1 : 
                  !!~this.props.location.search.indexOf('wechat') ? 2 : 0
    const pagination = {
      total:this.state.pagination.total,
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
        self.getDailyBillsDetail({pagination: pagination})
      },
      onChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = {offset: offset}
        self.changeHistory(pagination)
        self.getDailyBillsDetail({pagination: pagination})
      }
    }
    return(
      <div className={styles.view}>
        <Bread type={type} />
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
