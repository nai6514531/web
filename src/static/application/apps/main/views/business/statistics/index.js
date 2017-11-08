import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Input, Select, Row, message, DatePicker, Tabs } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import InputWithClear from '../../../components/input-with-clear/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import history from '../../../utils/history.js'
import { trim } from 'lodash'
import styles from './index.pcss'
const breadItems = [
  {
    title: '商家系统'
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
          if ( index < this.props.businessStatistics.data.objects.length - 1 ) {
            return <span>{ text }</span>
          }
          return {
            children: <span>合计</span>,
            props: {
              colSpan: 3
            }
          }
        },
      },
      {
        title: '月份',
        dataIndex: 'month',
        key: 'month',
        render: (text, record, index) => {
          if ( index < this.props.businessStatistics.data.objects.length - 1 ) {
            return <Link to={`/business/statistics/consume/${text}`}>{text}</Link>
          }
          return {
            props: {
              colSpan: 0
            }
          }
        },
      },
      {
        title: '模块数',
        dataIndex: 'totalDevice',
        key: 'totalDevice',
        render: (text, record, index) => {
          if ( index < this.props.businessStatistics.data.objects.length - 1 ) {
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
        title: '单脱',
        dataIndex: 'totalMode1',
        key: 'totalMode1'
      },
      {
        title: '快洗',
        dataIndex: 'totalMode2',
        key: 'totalMode2'
      },
      {
        title: '标准洗',
        dataIndex: 'totalMode3',
        key: 'totalMode3'
      },
      {
        title: '大物洗',
        dataIndex: 'totalMode4',
        key: 'totalMode4'
      },
      {
        title: '金额',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (text, record) => {
          return (
            `${(record.totalAmount/100).toFixed(2)}元`
          )
        }
      },

    ]
    // this.search = search
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'businessStatistics/list',
      payload: {
        data: {
          limit: -1,
          userId: this.props.common.userInfo.user.id
        }
      }
    })
  }
  render() {
    const { businessStatistics: { data: { objects, pagination } }, loading  } = this.props

    return (
      <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={false}
          rowKey='key'
          rowClassName={() => {}}
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
          if(record.time && record.device.serialNumber) {
            return (
              <Link to={`/business/statistics/device/${record.time}/${record.device.serialNumber}`}>{record.time}</Link>
            )
          }
          return (
            '-'
          )
        },
      },
      {
        title: '编号/楼道信息',
        render: (text, record, index) => {
          return (
            `${record.device.serialNumber}/ ${record.device.address || '无'}`
          )
        },
      },
      {
        title: '单脱',
        dataIndex: 'totalMode1',
        key: 'totalMode1'
      },
      {
        title: '快洗',
        dataIndex: 'totalMode2',
        key: 'totalMode2'
      },
      {
        title: '标准洗',
        dataIndex: 'totalMode3',
        key: 'totalMode3'
      },
      {
        title: '大物洗',
        dataIndex: 'totalMode4',
        key: 'totalMode4'
      },
      {
        title: '金额',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (text, record) => {
          return (
            `${(record.totalAmount/100).toFixed(2)}元`
          )
        }
      },
    ]
  }
  componentDidMount() {
    this.fetch(this.getParams())
  }
  change = (data) => {
    this.fetch({...this.getParams(), ...data})
  }
  fetch = (data) => {
    this.props.dispatch({
      type: 'businessStatistics/listByDates',
      payload: {
        data: data
      }
    })
  }
  changeHandler = (type, value) => {
    if(value) {
      this.search = { ...this.search, [type]: trim(value) }
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
    const data = {
       ...this.search,
      startAt,
      endAt,
      ownerId: this.props.common.userInfo.user.id,
      allDevices: 0,
      status: '7',
      period: 'month'
    }
    return data
  }
  searchClick = () => {
    const { date, deviceSerial } = this.search
    if( !date && !deviceSerial ) {
      message.info('请选择月份或模块编号进行查询')
      return
    }

    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.getParams())
  }
  disabledDate = (current) => {
    if(current) {
      return current.valueOf() > Date.now()
    }
  }
  render() {
    const { businessStatistics: { data: { objects, pagination } }, loading  } = this.props
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
        <InputWithClear
          placeholder='模块编号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'deviceSerial')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.deviceSerial}
         />
        <Button
          type='primary'
          onClick={this.searchClick}
          style={{marginBottom: '20px', marginRight: 20}}
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
            rowClassName={() => {}}
          />
      </div>
    )
  }
}

class BusinessStatistics extends Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'businessStatistics/updateData',
      payload: {
        type: transformUrl(location.search).type || '1'
      }
    })
  }
  handleTabChange = (type) => {
    this.props.dispatch({
      type: 'businessStatistics/updateData',
      payload: {
        type: type,
        data: {
          objects: []
        }
      }
    })
    history.push(`${location.pathname}?type=${type}`)
  }
  render() {
    const { businessStatistics: { data: { objects, pagination }, type }, loading  } = this.props
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
      type: 'businessStatistics/clear'
    })
  }
}
function mapStateToProps(state,props) {
  return {
    businessStatistics: state.businessStatistics,
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(BusinessStatistics)
