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

class DayConsume extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.month = this.props.match.params.month
    this.breadItems = [
      {
        title: '苏打生活'
      },
      {
        title: '统计报表',
        url: '/soda/statistics'
      },
      {
        title: `${this.month}`
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
        dataIndex: 'date',
        key: 'date',
        render: (text, record, index) => {
          return <Link to={`/soda/statistics/consume/${this.month}/${text}`}>{text}</Link>
        },
      },
      {
        title: '模块数',
        dataIndex: 'totalDevice',
        key: 'totalDevice'
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
    this.fetch(this.search)
  }
  fetch = (url) => {
    const daysInMonth = moment(this.month).daysInMonth()
    this.props.dispatch({
      type: 'businessStatistics/dayList',
      payload: {
        data: {
          ...url,
          startAt: `${this.month}-01`,
          endAt: `${this.month}-${daysInMonth}`
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
export default connect(mapStateToProps)(DayConsume)
