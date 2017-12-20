import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Row, message } from 'antd'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import moment from 'moment'
import { transformUrl, toQueryString } from '../../../../utils/'
import { trim } from 'lodash'

const dict = {
  '1' : 'firstPulseName',
  '2' : 'secondPulseName',
  '3' : 'thirdPulseName',
  '4' : 'fourthPulseName',
}

class DayDeviceConsume extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.month = this.props.match.params.month
    this.day = this.props.match.params.day
    this.deviceSerial = this.props.match.params.deviceSerial
    this.breadItems = [
      {
        title: '商家系统'
      },
      {
        title: '统计报表',
        url: '/business/statistics'
      },
      {
        title: `${this.month}`,
        url: `/business/statistics/consume/${this.month}`
      },
      {
        title: `${this.day}`,
        url: `/business/statistics/consume/${this.month}/${this.day}`
      },
      {
        title: `${this.deviceSerial}`
      }
    ]
    this.columns = [
      {
        title: '序号',
        dataIndex: 'key',
        key: 'key'
      },
      {
        title: '编号/楼道信息',
        render: (text, record, index) => {
          if(record.totalMode1 || record.totalMode2 || record.totalMode3 || record.totalMode4) {
            return (
             <span><Link to={`${record.deviceSerial}`}>{record.deviceSerial || '-'}</Link>/{record.device.address || '-'}</span>
            )
          }
          return (
            `${record.deviceSerial || '-'}/ ${record.device.address || '-'}`
          )
        },
      },
      {
        title: '洗衣金额',
        dataIndex: 'value',
        key: 'value',
        render: (text, record) => {
          return (
            `${(record.value/100).toFixed(2)}元`
          )
        }
      },
      {
        title: '洗衣手机号',
        dataIndex: 'mobile',
        key: 'mobile'
      },
      {
        title: '洗衣类型',
        render: (text, record) => {
          return (
            record.device[dict[record.deviceMode]]
          )
        }
      },
      {
        title: '下单时间',
        render: (text, record) => {
          return (
            `${moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}`
          )
        }
      },
    ]
  }
  componentDidMount() {
    this.fetch(this.search)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'businessStatistics/consumptionsList',
      payload: {
        data: {
          ...url,
          startAt: this.day,
          endAt: this.day,
          deviceSerial: this.deviceSerial,
          status: 7
        }
      }
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  render() {
    const { businessStatistics: { data: { objects, pagination } }, loading  } = this.props
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
    this.props.dispatch({ type: 'businessStatistics/clear'})
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
export default connect(mapStateToProps)(DayDeviceConsume)
