import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import querystring from 'querystring'
import { Table, message } from 'antd'

import history from '../../../../utils/history'
import { conversionUnit } from '../../../../utils/functions'

import DailyBillsService from '../../../../services/soda-manager/daily-bills'

import Breadcrumb from '../../../../components/layout/breadcrumb'

import CONSTANT from '../../constant'

import styles from './index.pcss'

const PAEG_SIZE = 10

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
          return `${conversionUnit(totalAmount)}`
        }
      },
      {
        title: '收款方式',
        render: (record) => {
          return CONSTANT.CASH_ACCOUNT_TYPE[record.cashAccount.type]
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
        dataIndex: 'cashAccount',
        render: (cashAccount, record) => {
          if (!!~[CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY].indexOf(cashAccount.type)) {
            return _.template([
              '<%- realName %>',
              '账号：<%- account %>',
              '手机号：<%- mobile %>'
              ].join(' | '))({
                realName: cashAccount.realName,
                account: cashAccount.account || '-',
                mobile: record.mobile || '-'
              })
          } 
          if (!!~[CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT].indexOf(cashAccount.type)) {
            return _.template([
              '<%- realName %>',
              ].join(' | '))({
                realName: cashAccount.realName
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
          let label
          switch (status) {
            case CONSTANT.BILL_SETTLEMENT_STATUS_IS_DEFAULT:
              label = <span>未申请结算</span>
              break;
            case CONSTANT.BILL_SETTLEMENT_STATUS_IS_WAITING:
              label = <span><i className={styles.waiting}></i>等待结算</span>
              break;
            case CONSTANT.BILL_SETTLEMENT_STATUS_IS_SUCCESS:
              label = <span><i className={styles.success}></i>结算成功</span>
              break;
            case CONSTANT.BILL_SETTLEMENT_STATUS_IS_PAYING:
              label = <span><i className={styles.paying}></i>结算中</span>
              break;
            case CONSTANT.BILL_SETTLEMENT_STATUS_IS_FAIL:
              label = <span><i className={styles.fail}></i>结算失败</span>
              break;
            default:
              label = <span>-</span>
              break;
          }
          return <p className={styles.status}>{label}</p>
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
    this.getBillsDetail({
      pagination: {
        limit: parseInt(query.limit || PAEG_SIZE, 10),
        offset: parseInt(query.offset || 0, 10)
      }
    })
  }
  getBillsDetail({...options}) {
    const pagination = _.extend(this.state.pagination, options.pagination || {})
    const id = this.props.match.params.id
    const search = _.extend({ billId: id }, pagination)

    this.setState({ loading: true })
    DailyBillsService.list(search).then((res) => {
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
