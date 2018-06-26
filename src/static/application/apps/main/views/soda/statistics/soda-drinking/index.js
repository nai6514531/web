import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Input, Select, Row, message, DatePicker, Tabs } from 'antd'

import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { InputScan } from '../../../../components/form/input'
import { transformUrl, toQueryString } from '../../../../utils/'
import moment from 'moment'
import { trim } from 'lodash'
import styles from '../../../../assets/css/search-bar.pcss'

const breadItems = [
  {
    title: '苏打饮水'
  },
  {
    title: '统计报表'
  }
]

const TabPane = Tabs.TabPane
const { MonthPicker } = DatePicker

class MonthStatistics extends Component {
  constructor(props) {
    super(props)
    // const search = transformUrl(location.search)
    this.columns = [
      {
        title: '序号',
        dataIndex: 'key',
        key: 'key',
        render: (text, record, index) => {
          if ( index < this.props.drinkingBusinessStatistics.data.objects.length - 1 ) {
            return <span>{ text }</span>
          }
          return {
            children: <span>合计</span>,
            props: {
              colSpan: 4
            }
          }
        },
      },
      {
        title: '月份',
        dataIndex: 'month',
        key: 'month',
        render: (text, record, index) => {
          if ( index < this.props.drinkingBusinessStatistics.data.objects.length - 1 ) {
            return <Link to={`/soda-drinking/statistics/consume/${text}`}>{text}</Link>
          }
          return {
            props: {
              colSpan: 0
            }
          }
        },
      },
      {
        title: '消费设备数',
        dataIndex: 'totalDevice',
        key: 'totalDevice',
        render: (text, record, index) => {
          if ( index < this.props.drinkingBusinessStatistics.data.objects.length - 1 ) {
            return <span>{ text }</span>
          }
          return {
            props: {
              colSpan: 0
            }
          }
        },
      },
      {
        title: '消费订单数',
        dataIndex: 'orderCount',
        key: 'orderCount',
        render: (text, record, index) => {
          if ( index < this.props.drinkingBusinessStatistics.data.objects.length - 1 ) {
            return <span>{ text }</span>
          }
          return {
            props: {
              colSpan: 0
            }
          }
        },
      },
      {
        title: '消费金额',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (text, record) => {
          return (
            `${(record.totalAmount/100).toFixed(2)}元`
          )
        }
      },
      {
        title: '退款金额',
        dataIndex: 'totalRefund',
        key: 'totalRefund',
        render: (text, record) => {
          return (
            `${(record.totalRefund/100).toFixed(2)}元`
          )
        }
      }
    ]
    // this.search = search
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'drinkingBusinessStatistics/list',
      payload: {
        data: {
          limit: 100   //按月份统计无分页需求
        }
      }
    })
  }
  render() {
    const { drinkingBusinessStatistics: { data: { objects, pagination } }, loading  } = this.props

    return (
      <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={false}
          rowKey='key'
          rowClassName={() => {}}
          scroll={{ x: 1000 }}
        />
    )
  }
}

class DeviceStatistics extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    // 默认查询当月
    if (!this.search.date) {
      this.dateChange(null, moment(new Date()).format('YYYY-MM'))
    }
    // 日期可为空
    if(this.search.date === 'null') {
      this.search.date = null
    }
    this.columns = [
      {
        title: '序号',
        dataIndex: 'key',
        key: 'key'
      },
      {
        title: '月份',
        render: (text, record, index) => {
          if(record.time && record.device && record.device.serialNumber) {
            return (
              <Link to={`/soda-drinking/statistics/device/${record.time}/${record.device.serialNumber}`}>{record.time}</Link>
            )
          }
          return (
            <span>{record.time || '-'}</span>
          )
        },
      },
      {
        title: '设备编号',
        render: (text, record, index) => {
          if(record.device) {
            return (
              `${record.device.serialNumber || '无'}`
            )
          }
          return '-'
        },
      },
      {
        title: '服务地点',
        render: (text, record, index) => {
          if(record.device) {
            return (
              `${record.device.serviceAddressName || '无'}`
            )
          }
          return '-'
        },
      },
      {
        title: '消费订单数',
        dataIndex: 'orderCount',
        key: 'orderCount'
      },
      {
        title: '消费金额',
        dataIndex: 'totalValue',
        key: 'totalValue',
        render: (text, record) => {
          return (
            `${(record.totalValue/100).toFixed(2)}元`
          )
        }
      },
      {
        title: '退款金额',
        dataIndex: 'totalRefund',
        key: 'totalRefund',
        render: (text, record) => {
          return (
            `${(record.totalRefund/100).toFixed(2)}元`
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.fetch(this.getParams())
  }
  change = (pageInfo) => {
    const { date, deviceSerial } = this.search
    if( !date && !deviceSerial ) {
      message.info('请选择月份或模块编号进行查询')
      return 'NOTRENDER'
    }
    this.fetch({...this.getParams(), ...pageInfo})
  }
  fetch = (data) => {
    const { date, deviceSerial } = data
    if( !date && !deviceSerial ) {
      message.info('请选择月份或模块编号进行查询')
      return
    }
    this.props.dispatch({
      type: 'drinkingBusinessStatistics/listByDates',
      payload: {
        data: data
      }
    })
  }
  changeHandler = (type, e) => {
    let val = e.target.value || ''

    if (val) {
      this.search = { ...this.search, [type]: trim(val) }
    } else {
      delete this.search[type]
    }
  }
  dateChange = (field, value) => {
    if(value) {
      this.search = { ...this.search, date: value }
    } else {
      this.search = { ...this.search, date: null }
    }
  }
  getParams = () => {
    const daysInMonth = moment(this.search.date).daysInMonth()
    let startAt, endAt
    if(this.search.date) {
      startAt = `${this.search.date}-01`
      endAt = `${this.search.date}-${daysInMonth}`
    } else {
      startAt = ''
      endAt = ''
    }
    // 16-->成功 4-->已退款
    const data = {
       ...this.search,
      startAt,
      endAt,
      allDevices: 0,
      status: '16,4',
      period: 'month'
    }
    return data
  }
  searchClick = () => {
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.getParams())
  }
  disabledDate = (current) => {
    if(current) {
      return current.valueOf() > Date.now()
    }
  }
  render() {
    const { drinkingBusinessStatistics: { data: { objects, pagination } }, loading  } = this.props
    let defaultValue
    if(this.search.date === null) {
      defaultValue = null
    } else if (this.search.date) {
      defaultValue = moment(this.search.date, 'YYYY-MM-DD')
    } else {
      defaultValue = moment(new Date(), 'YYYY-MM-DD')
    }
    return (
      <div>
        <MonthPicker
          className={styles.input}
          onChange={this.dateChange}
          disabledDate={this.disabledDate}
          defaultValue={ defaultValue }
          placeholder="请选择月份" />
        <span className={styles.input}>
          <InputScan
            placeholder='模块编号'
            onChange={this.changeHandler.bind(this, 'deviceSerial')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.deviceSerial}
          />
        </span>
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          >
          筛选
        </Button>
        <DataTable
            dataSource={objects}
            columns={this.columns}
            loading={loading}
            pagination={pagination}
            change={this.change}
            rowKey='key'
            scroll={{ x: 1000 }}
            rowClassName={() => {}}
          />
      </div>
    )
  }
}

class BusinessStatistics extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'drinkingBusinessStatistics/updateData',
      payload: {
        type: transformUrl(location.search).type || '1'
      }
    })
  }
  handleTabChange = (type) => {
    this.props.dispatch({
      type: 'drinkingBusinessStatistics/updateData',
      payload: {
        type: type,
        data: {
          objects: []
        }
      }
    })
    this.props.history.push(`${location.pathname}?type=${type}`)
  }
  render() {
    const { drinkingBusinessStatistics: { data: { objects, pagination }, type }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Tabs activeKey={type} type='card' onChange={this.handleTabChange}>
          <TabPane tab='按月份统计' key='1'>
            { type == 1 ? <MonthStatistics {...this.props}/> : null }
          </TabPane>
          <TabPane tab='按模块统计' key='2'>
            { type == 2 ? <DeviceStatistics {...this.props}/> : null }
          </TabPane>
        </Tabs>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({
      type: 'drinkingBusinessStatistics/clear'
    })
  }
}
function mapStateToProps(state,props) {
  return {
    drinkingBusinessStatistics: state.drinkingBusinessStatistics,
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(BusinessStatistics)
