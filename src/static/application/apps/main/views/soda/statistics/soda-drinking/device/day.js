import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Row, message } from 'antd'
import DataTable from '../../../../../components/data-table/'
import Breadcrumb from '../../../../../components/layout/breadcrumb/'
import moment from 'moment'
import { transformUrl, toQueryString } from '../../../../../utils/'
import { trim } from 'lodash'

class DeviceSearchByDay extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.month = this.props.match.params.month
    this.deviceSerial = this.props.match.params.deviceSerial
    this.breadItems = [
      {
        title: '苏打饮水'
      },
      {
        title: '统计报表',
        url: '/soda-drinking/statistics'
      },
      {
        title: this.month
      }
    ]
    this.columns = [
      {
        title: '序号',
        dataIndex: 'key',
        key: 'key'
      },
      {
        title: '日期',
        render: (text, record, index) => {
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
    this.fetch(this.search)
  }
  fetch = (url) => {
    const daysInMonth = moment(this.month).daysInMonth()
    this.props.dispatch({
      type: 'drinkingBusinessStatistics/listByDates',
      payload: {
        data: {
          ...url,
          startAt: `${this.month}-01`,
          endAt: `${this.month}-${daysInMonth}`,
          deviceSerial: this.deviceSerial,
          status: '16,4',
          period: 'date'
        }
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  render() {
    const { drinkingBusinessStatistics: { data: { objects, pagination } }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
          scroll={{ x: 1000 }}
          rowKey='key'
          rowClassName={() => {}}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'drinkingBusinessStatistics/clear'})
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
export default connect(mapStateToProps)(DeviceSearchByDay)
