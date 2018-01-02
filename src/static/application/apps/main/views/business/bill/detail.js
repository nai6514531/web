import React, { Component } from 'react'
import Promise from 'bluebird'
import _ from 'underscore'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { Table, Popconfirm, Select, DatePicker, message, Modal } from 'antd'
const Option = Select.Option
const confirm = Modal.confirm

import DailyBillsService from '../../../services/soda-manager/daily-bills'
import BillsService from '../../../services/soda-manager/bills'
import Breadcrumb from '../../../components/layout/breadcrumb'
import { conversionUnit } from '../../../utils/functions'
import CONSTANT from '../constant'

import styles from './index.pcss'

const PAEG_SIZE = 10

const breadItems = [
  {
    title: '商家系统'
  },
  {
    title: '结算查询',
    url: '/business/bill'
  },
  {
    title: '账单明细'
  }
]

class Detail extends Component{
  constructor(props) {
    super(props)

    this.state = {
      list: [],
      count: 0,
      totalAmount: 0,
      loading: false,
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset:0
      }
    }
    this.columns　= [
      {
        title: '账单号',
        dataIndex: 'id',
      }, {
        title: '运营商',
        dataIndex: 'user',
        render: (user) => {
          return `${user.name}`
        }
      }, {
        title: '金额',
        dataIndex: 'totalAmount',
        render: (value) => {
          return conversionUnit(value)
        }
      }, {
        title: '账期',
        dataIndex: 'billAt',
        render: (date) => {
          return moment(date).format('YYYY-MM-DD')
        }
      }, {
        title: '账户信息',
        render: (record) => {
          let { cashAccount: { type, realName, account, bankName }, user: { mobile } } = record

          if (!!~[CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY].indexOf(type)) {
            return `${realName || '-'} | 账号:${account || '-'}`
          }
          if (!!~[CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT].indexOf(type)) {
            return `${realName || '-'}`
          }
          if (!!~[CONSTANT.CASH_ACCOUNT_TYPE_IS_BANK].indexOf(type)) {
            return _.without([`户名:${realName || '-'}`, `${bankName}`, `${account}`, `${mobile}`], '').join(' | ')
          }
          return '-'
        }
      }, {
        title: '订单量',
        dataIndex: 'count',
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (status, record) => {
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
      }, {
        title: '操作',
        key: 'method',
        render: (record) => {
          let { id } = this.props.match.params

          return <Link to={`/business/daily-bill/${record.id}?billId=${id}`}>明细</Link>
        }
      }
    ]
  }
  componentDidMount() {
    this.getDailyBill()
    this.getBillDetail()
  }
  getDailyBill({ ...options }) {
    let { id } = this.props.match.params
    let pagination = options.pagination || {}
    pagination = _.pick({...this.state.pagination, ...pagination}, 'limit', 'offset')
    this.setState({ loading: true, pagination: pagination })
    let data = { ...pagination, billId: id }

    if (id === 'detail') {
      data = { ...pagination, status: 0 }
    }
    DailyBillsService.list(data).then((res) => {
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
      this.setState({ list: [], loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getBillDetail() {
    let { id } = this.props.match.params

    if (id === 'detail') {
      return
    }
    BillsService.getDetail(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({
        count: res.data.count || 0,
        totalAmount: res.data.totalAmount || 0
      })
    }).catch((err) => {
      message.error(err.message || '网络异常！请重试')
    })
  }
  changeHistory (options) {
    let query = _.pick({ ...this.state.search, ...this.state.pagination, ...options }, 'offset', 'limit', 'status', 'endAt', 'startAt', 'keys', 'type')
    this.props.history.push(`/business/daily-bill?${querystring.stringify(query)}`)
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
        self.getDailyBill({ pagination })
      },
      onChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = { offset: offset }
        self.getDailyBill({ pagination })
      }
    }
  }
  render() {
    const { count, totalAmount, list, loading  } = this.state

    return (<section className={styles.detail}>
      <Breadcrumb items={breadItems} />
      {
        count !== 0 ?
        <p className={styles.tip}>
          共包含
          <span>{count}</span>
          天账单，结算金额总计
          <span>{conversionUnit(totalAmount)}</span>元
        </p>
        : null
      }
      <Table scroll={{ x: 900 }}
        style= {{ marginTop: 16 }}
        dataSource={list}
        columns={this.columns}
        pagination={this.pagination.call(this)}
        loading={loading}
        rowKey={record => record.id}
      />
    </section>)
  }
}

export default Detail
