import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Row, message } from 'antd'
import DataTable from '../../../../../components/data-table/'
import Breadcrumb from '../../../../../components/layout/breadcrumb/'
import moment from 'moment'
import { trim } from 'lodash'

class OperationStatisticsByDay extends Component {
  constructor(props) {
    super(props)
    this.month = this.props.match.params.month
    console.log("this.month ",this.month )
    this.breadItems = [
      {
        title: '苏打生活'
      },
      {
        title: '经营统计',
        url: '/soda/operation-statistics'
      },
      {
        title: this.month
      }
    ]
    this.columns = [{
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      width: 50,
    }, {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      render(text, record, index) {
          return moment(text).format('YYYY-MM-DD')
      },
    }, {
      title: '用户数',
      dataIndex: 'totalUser',
      key: 'totalUser',
      width: 100,
    }, {
      title: '新增用户数',
      dataIndex: 'totalNewUser',
      key: 'totalNewUser',
      width: 100,
    },{
      title: '模块总数',
      dataIndex: 'totalDevice',
      key: 'totalDevice',
    width: 100,},
     {
      title: '已售模块数',
      dataIndex: 'totalSoldDevice',
      key: 'totalSoldDevice',
    width: 100,},
     {
      title: '空闲模块',
      dataIndex: 'totalUnusedDevice',
      key: 'totalUnusedDevice',
    width: 100,},
     {
      title: '独立充值用户数',
      dataIndex: 'totalRechargeUser',
      key: 'totalRechargeUser',
    width: 100,},
     {
      title: '独立消费用户数',
      dataIndex: 'totalConsumeUser',
      key: 'totalConsumeUser',
    width: 100,},
    {
      title: '充值金额',
      dataIndex: 'totalRecharge',
      key: 'totalRecharge',
      width: 100,
      render: (totalRecharge) => {
        return Math.round(totalRecharge)/100 + "元";
      }
    },{
      title: '消费金额',
      dataIndex: 'totalConsume',
      key: 'totalConsume',
      width: 100,
      render: (totalConsume) => {
        return Math.round(totalConsume)/100 + "元";
      }
    },{
      title: '微信消费',
      dataIndex: 'totalWechatConsume',
      key: 'totalWechatConsume',
      width: 100,
      render: (totalWechatConsume) => {
        return Math.round(totalWechatConsume)/100 + "元";
      }
    },{
      title: '支付宝消费',
      dataIndex: 'totalAlipayConsume',
      key: 'totalAlipayConsume',
      width: 100,
      render: (totalAlipayConsume) => {
        return Math.round(totalAlipayConsume)/100 + "元";
      }
    },{
      title: '余额消费',
      dataIndex: 'totalWalletConsume',
      key: 'totalWalletConsume',
      width: 100,
      render: (totalWalletConsume) => {
        return Math.round(totalWalletConsume)/100 + "元";
      }
    },{
      title: 'IC卡消费',
      dataIndex: 'totalChipcardConsume',
      key: 'totalChipcardConsume',
      width: 100,
      render: (totalChipcardConsume) => {
        return Math.round(totalChipcardConsume)/100 + "元";
      }
    },{
      title: '微信充值金额',
      dataIndex: 'totalWechatRecharge',
      key: 'totalWechatRecharge',
      width: 100,
      render: (totalWechatRecharge) => {
        return Math.round(totalWechatRecharge)/100 + "元";
      }
    },{
      title: '支付宝充值金额',
      dataIndex: 'totalAlipayRecharge',
      key: 'totalAlipayRecharge',
      width: 100,
      render: (totalAlipayRecharge) => {
        return Math.round(totalAlipayRecharge)/100 + "元";
      }
    }]
  }
  componentDidMount() {
    this.fetch()
  }
  fetch = (url) => {
    const daysInMonth = moment(this.month).daysInMonth()
    this.props.dispatch({
      type: 'operationStatistics/listByDay',
      payload: {
        data: {
          startAt: `${this.month}-01`,
          endAt: `${this.month}-${daysInMonth}`,
          limit: 31
        }
      }
    })
  }
  render() {
    const { operationStatistics: { data: { objects } }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={false}
          change={this.change}
          scroll={{ x: 1000 }}
          rowKey='key'
          rowClassName={() => {}}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'operationStatistics/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    operationStatistics: state.operationStatistics,
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(OperationStatisticsByDay)
