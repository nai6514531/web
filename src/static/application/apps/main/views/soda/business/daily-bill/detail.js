import React, { Component } from 'react'
import querystring from 'querystring'
import moment from 'moment'
import op from 'object-path'
import { Button, Table, Icon, Popconfirm, message } from 'antd'

import DailyBillsService from '../../../../services/soda-manager/daily-bills'
import DrinkingDailyBillsService from '../../../../services/soda-manager/drinking-daily-bills'
import history from '../../../../utils/history'
import { conversionUnit } from '../../../../utils/functions'
import Breadcrumb from '../../../../components/layout/breadcrumb'

import styles from './index.pcss'

const PAEG_SIZE = 10

const breadItems = [
  {
    title: '每日账单',
    url: '/PATHNAME/business/daily-bill'
  },
  {
    title: '明细'
  }
]

const billBreadItems = [
  {
    title: '结算查询',
    url: '/PATHNAME/business/bill'
  },
  {
    title: '账单明细',
    url: `/PATHNAME/business/bill/BILL_ID`
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
    let { billId, isBillsView } = this.props
    let items = isBillsView ? billBreadItems : breadItems

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

class App extends Component{
  constructor(props) {
    super(props)

    this.state = {
      list: [],
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
        dataIndex: 'id',
      }, {
        title: '设备编号/服务地点',
        dataIndex: 'serial',
        render: (serial, record) => {
          return `${serial || '-' } / ${op(record).get('device.serviceAddress.school.address') || '-'}`
        }
      }, {
        title: '服务名',
        dataIndex: 'type',
        render: (type, record) => {
          let names = (op(record).get('snapshot.modes') || []).map((mode) => {
            return mode.name
          })
          return (names || []).join('/')
        }
      }, {
        title: '消费金额',
        dataIndex: 'value',
        key:'value',
        render: (value) => {
          return `${conversionUnit(value)}元`
        }
      },{
        title: '支付方式',
        dataIndex: 'payment.name',
        key: 'payment.name',
        render: (name) => {
          return `${name || '-'}`
        }
      },{
        title: '消费手机号',
        dataIndex: 'mobile',
        render: (mobile) => {
          return `${mobile}`
        }
      }, {
        title: '下单时间',
        dataIndex: 'createdAt',
        render: (date) => {
          return moment(date).format('YYYY-MM-DD HH:mm:ss')
        }
      }, {
        title: '订单状态',
        dataIndex: 'status',
        render: (text, record) => {
          return `${record.status.description}`
        }
      },{
        title: '是否结算',
        dataIndex: 'hasSettled',
        render: (hasSettled) => {
          return hasSettled ? '是' : '否'
        }
      }
    ]
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let pagination = _.pick(query, 'limit', 'offset')

    if (!!query.billId) {
      this.isBillsView = true
      this.billId = query.billId
    }
    this.list(pagination)
  }
  list(options) {
    let { location: { pathname } } = this.props
    let isDringking = !!~pathname.indexOf('soda-drinking')
    let { id } = this.props.match.params
    let pagination = options.pagination || {}
    pagination = _.pick({...this.state.pagination, ...pagination}, 'limit', 'offset')
    this.setState({ loading: true, pagination })

    if (isDringking) {
      DrinkingDailyBillsService.getTickets({...pagination, id: id }).then((res) => {
        if (res.status !== 'OK') {
          throw new Error(res.message)
        }
        const data = res.data

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
      return
    }
    DailyBillsService.getTickets({...pagination, id: id }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data

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
    const { id } = this.props.match.params
    const query = querystring.stringify(_.pick({ ...this.state.pagination, ...options }, 'offset', 'limit'))
    let pathname = op(location).get('pathname').split('/')[1]
    if (this.isBillsView) {
    this.props.history.push(`/${pathname}/business/daily-bill/${id}?${query}&billId=${this.billId}`)
      return
    }
    this.props.history.push(`/${pathname}/business/daily-bill/${id}?${query}`)
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
    const { list, loading } = this.state

    return (<section>
      <Bread isBillsView={this.isBillsView} billId={this.billId} />
      <Table scroll={{ x: 500 }}
        dataSource={list}
        columns={this.columns}
        pagination={this.pagination.call(this)}
        loading={loading}
        rowKey={record => record.id}
        bordered
      />
    </section>)
  }
}

export default App
