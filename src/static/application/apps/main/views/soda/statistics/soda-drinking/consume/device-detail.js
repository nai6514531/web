import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import op from 'object-path'
import { Button, Row, message } from 'antd'
import DataTable from '../../../../../components/data-table/'
import Breadcrumb from '../../../../../components/layout/breadcrumb/'
import moment from 'moment'
import { transformUrl, toQueryString } from '../../../../../utils/'
import { trim } from 'lodash'

class DayDeviceConsume extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.month = this.props.match.params.month
    this.day = this.props.match.params.day
    this.deviceSerial = this.props.match.params.deviceSerial
    if( this.search.from === 'device' ) {
      this.breadItems = [
        {
          title: '苏打饮水'
        },
        {
          title: '统计报表',
          url: '/soda-drinking/statistics'
        },
        {
          title: `${this.month}`,
          url: `/soda-drinking/statistics/device/${this.month}/${this.deviceSerial}`
        },
        {
          title: `${this.deviceSerial}`
        }
      ]
    } else {
      this.breadItems = [
        {
          title: '苏打饮水'
        },
        {
          title: '统计报表',
          url: '/soda-drinking/statistics'
        },
        {
          title: `${this.month}`,
          url: `/soda-drinking/statistics/consume/${this.month}`
        },
        {
          title: `${this.day}`,
          url: `/soda-drinking/statistics/consume/${this.month}/${this.day}`
        },
        {
          title: `${this.deviceSerial}`
        }
      ]
    }
    this.columns = [
      {
        title: '序号',
        dataIndex: 'key',
        key: 'key'
      },
      {
        title: '设备编号',
        dataIndex: 'snapshot.device.serial',
        key: 'snapshot.device.serial',
        render: (text, record, index) => {
          return `${text || '无'}`
        },
      },
      {
        title: '订单号',
        dataIndex: 'ticketId',
        key: 'ticketId'
      },
      {
        title: '消费手机号',
        dataIndex: 'mobile',
        key: 'mobile'
      },
      {
        title: '服务地点',
        render: (text, record, index) => {
          if(record.device && record.device.serviceAddress) {
            return (
              `${record.device.serviceAddress.school.address || '无'}`
            )
          }
          return '-'
        },
      },
      {
        title: '运营商名称',
        dataIndex: 'owner.name',
        key: 'owner.name'
      },
      {
        title: '冷水量',
        dataIndex: 'cold.amount',
        key: 'cold.amount',
        render: (text, record) => {
          return (
            `${(text/1000).toFixed(2)}升`
          )
        }
      },
      {
        title: '热水量',
        dataIndex: 'hot.amount',
        key: 'hot.amount',
        render: (text, record) => {
          return (
            `${(text/1000).toFixed(2)}升`
          )
        }
      },
      {
        title: '总量',
        render: (text, record) => {
          if(record.hot && record.cold) {
            return (
              `${((record.hot.amount + record.cold.amount)/1000).toFixed(2)}升`
            )
          }
          return '-'
        }
      },
      {
        title: '消费金额',
        dataIndex: 'value',
        key: 'value',
        render: (text, record) => {
          return (
            `${(text/100).toFixed(2)}元`
          )
        }
      },
      {
        title: '状态',
        dataIndex: 'status.description',
        key: 'status.description',
        render: (text, record) => {
          return (
            `${text}`
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.fetch(this.search)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'drinkingBusinessStatistics/consumptionsList',
      payload: {
        data: {
          ...url,
          startAt: this.day,
          endAt: this.day,
          deviceSerial: this.deviceSerial,
          status: '16,4'
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
export default connect(mapStateToProps)(DayDeviceConsume)
