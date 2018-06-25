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

class DayDetailConsume extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.month = this.props.match.params.month
    this.day = this.props.match.params.day
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
        title: `${this.day}`
      }
    ]
    this.columns = [
      {
        title: '序号',
        dataIndex: 'key',
        key: 'key'
      },
      // {
      //   title: '日期',
      //   render: (record) => {
      //       if(record.date) {
      //           return (
      //               moment(record.date).format('YYYY-MM-DD HH:mm')
      //           )
      //       }
      //      return '-'
      //   }
      // },
      {
        title: '设备编号',
        render: (text, record, index) => {
          if(record.device) {
            // 屏蔽进入按设备统计日消费详情
            // if(record.totalAmount) {
            //   return (
            //    <Link to={`/soda-drinking/statistics/consume/${this.month}/${this.day}/${record.device.serialNumber}`}>{record.device.serialNumber || '-'}</Link>
            //   )
            // }
            return (
              `${record.device.serialNumber || '-'}`
            )
          }
          return '-'
        },
      },
      {
        title: '学校服务地点',
        render: (text, record, index) => {
          if(record.device) {
            return (
              `${record.device.address || '-'}`
            )
          }
        }
      },
      {
        title: '运营商名称',
        dataIndex: 'owner.name',
        key: 'owner.name'
      },
      {
        title: '冷水量',
        dataIndex: 'coldAmount',
        key: 'coldAmount',
        render: (text, record) => {
          return (
            `${(record.coldAmount/1000).toFixed(2)}升`
          )
        }
      },
      {
        title: '热水量',
        dataIndex: 'hotAmount',
        key: 'hotAmount',
        render: (text, record) => {
          return (
            `${(record.hotAmount/1000).toFixed(2)}升`
          )
        }
      },
      {
        title: '总量',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        render: (text, record) => {
          return (
            `${(record.totalAmount/1000).toFixed(2)}升`
          )
        }
      },
      {
        title: '金额',
        dataIndex: 'totalValue',
        key: 'totalValue',
        render: (text, record) => {
          return (
            `${(record.totalValue/100).toFixed(2)}元`
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
      type: 'drinkingBusinessStatistics/listByDevices',
      payload: {
        data: {
          ...url,
          startAt: this.day,
          endAt: this.day,
          status: '7'
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
export default connect(mapStateToProps)(DayDetailConsume)
