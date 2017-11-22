import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Promise from 'bluebird'
import moment from 'moment'
import querystring from 'querystring'
import { Table, message} from 'antd'

import dailyBillsService from '../../../../services/soda-manager/daily-bills'

import history from '../../../../utils/history'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import styles from '../index.pcss'

const BILL_ID = querystring.parse(window.location.search).billId
const PAEG_SIZE = 10

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
    title: '账单明细',
    url: `/finance/settlement/bills/${BILL_ID}?type=wechat`,
  },
  {
    title: '明细'
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
    title: '账单明细',
    url: `/finance/settlement/bills/${BILL_ID}?type=alipay`,
  },
  {
    title: '明细'
  }
]
const SERVICE_TYPE = { 1: '单拖', 2: '快洗', 3: '标准', 4: '大物洗' }
const PAY_TYPE = { 1: '微信', 2: '支付宝', 3: '账户余额', 4: 'IC卡余额' }
const BILLS_STATUS = { 4: '已退款', 7: '正常' }

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
        title: '设备编号/楼道信息',
        dataIndex: 'device',
        render: (device) => {
          return `${device.serial}/${device.serial}`
        }
      },
      {
        title: '服务类型',
        dataIndex: 'type',
        render: (type) => {
          return SERVICE_TYPE[type]
        }
      },
      {
        title: '金额',
        dataIndex: 'pay',
        key:'pay.amount',
        render: (pay) => {
          return `${pay.amount/100}元`
        }
      },
      {
        title: '支付方式',
        dataIndex: 'pay',
        render: (pay) => {
          return PAY_TYPE[pay.type] || '-'
        }
      },
      {
        title: '洗衣手机号',
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
        title: '状态',
        dataIndex: 'status',
        render: (status) => {
          return BILLS_STATUS[status] || '-'
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

    this.getDailyBillsDetail({pagination: {limit: parseInt(query.limit || PAEG_SIZE, 10), offset: parseInt(query.offset || 0, 10)}})
  }
  getDailyBillsDetail({ ...options }) {
    const pagination = _.extend(this.state.pagination, options.pagination || {})
    const id = this.props.match.params.id
    const search = _.extend({billId: id}, pagination)
    this.setState({ loading: true })
    dailyBillsService.list(search).then((res) => {
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
    let payType = !!~this.props.location.search.indexOf('alipay') ? 'alipay' : 
      !!~this.props.location.search.indexOf('wechat') ? 'wechat' : ''
    let pagination = _.clone(this.state.pagination)
    let id = this.props.match.params.id
    options = _.extend(pagination, options)
    options.type = payType
    options.billId = BILL_ID

    let query = querystring.stringify(_.pick(options, 'offset', 'limit', 'type', 'billId'))
    history.push(`/finance/settlement/daily-bills/${id}?${query}`)
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
