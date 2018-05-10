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

class OperationStatisticsByMonth extends Component {
  constructor(props) {
    super(props)
    this.breadItems = [
      {
        title: '苏打生活'
      },
      {
        title: '经营统计'
      }
    ]
    this.columns = [{
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      width: '50px',
      render: (text, record, index) => {
        if ( index > 0 ) {
          return <span>{ text }</span>
        }
        return {
          children: <span>合计</span>,
          props: {
            colSpan: 9
          }
        }
      },
    }, {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      width: '100px',
      render(text, record, index) {
        if (index > 0) {
          return <Link to={"/soda/operation-statistics/" + record.month}>{text}</Link>;
        }
        return {
          props: {
            colSpan: 0
          }
        }
      },
    }, {
      title: '用户数',
      dataIndex: 'totalUser',
      key: 'totalUser',
      width: '100px',
      render(text, record, index) {
        if (index > 0) {
          return <span>{ text }</span>
        }
        return {
          props: {
            colSpan: 0
          }
        }
      },
    }, {
      title: '新增用户数',
      dataIndex: 'totalNewUser',
      key: 'totalNewUser',
      width: '100px',
      render(text, record, index) {
        if (index > 0) {
          return <span>{ text }</span>
        }
        return {
          props: {
            colSpan: 0
          }
        }
      },
    },{
      title: '模块总数',
      dataIndex: 'totalDevice',
      key: 'totalDevice',
      width: '100px',
      render(text, record, index) {
        if (index > 0) {
          return <span>{ text }</span>
        }
        return {
          props: {
            colSpan: 0
          }
        }
      },
    }, {
      title: '已售模块数',
      dataIndex: 'totalSoldDevice',
      key: 'totalSoldDevice',
      width: '100px',
      render(text, record, index) {
        if (index > 0) {
          return <span>{ text }</span>
        }
        return {
          props: {
            colSpan: 0
          }
        }
      },
    }, {
      title: '空闲模块',
      width: '100px',
      dataIndex: 'totalUnusedDevice',
      key: 'totalUnusedDevice',
      render(text, record, index) {
        if (index > 0) {
          return <span>{ text }</span>
        }
        return {
          props: {
            colSpan: 0
          }
        }
      },
    }, {
      title: '独立充值用户数',
      width: '100px',
      dataIndex: 'totalRechargeUser',
      key: 'totalRechargeUser',
      render(text, record, index) {
        if (index > 0) {
          return <span>{ text }</span>
        }
        return {
          props: {
            colSpan: 0
          }
        }
      },
    }, {
      title: '独立消费用户数',
      width: '100px',
      dataIndex: 'totalConsumeUser',
      key: 'totalConsumeUser',
      render(text, record, index) {
        if (index > 0) {
          return <span>{ text }</span>
        }
        return {
          props: {
            colSpan: 0
          }
        }
      },
    },{
      title: '充值金额',
      dataIndex: 'totalRecharge',
      key: 'totalRecharge',
      width: '100px',
      render: (totalRecharge) => {
        return Math.round(totalRecharge)/100 + "元";
      }
    },{
      title: '消费金额',
      dataIndex: 'totalConsume',
      key: 'totalConsume',
      width: '100px',
      render: (totalConsume) => {
        return Math.round(totalConsume)/100 + "元";
      }
    },{
      title: '微信消费',
      dataIndex: 'totalWechatConsume',
      key: 'totalWechatConsume',
      width: '100px',
      render: (totalWechatConsume) => {
        return Math.round(totalWechatConsume)/100 + "元";
      }
    },{
      title: '支付宝消费',
      dataIndex: 'totalAlipayConsume',
      key: 'totalAlipayConsume',
      width: '100px',
      render: (totalAlipayConsume) => {
        return Math.round(totalAlipayConsume)/100 + "元";
      }
    },{
      title: '余额消费',
      width: '100px',
      dataIndex: 'totalWalletConsume',
      key: 'totalWalletConsume',
      render: (totalWalletConsume) => {
        return Math.round(totalWalletConsume)/100 + "元";
      }
    },{
      title: 'IC卡消费',
      width: '100px',
      dataIndex: 'totalChipcardConsume',
      key: 'totalChipcardConsume',
      render: (totalChipcardConsume) => {
        return Math.round(totalChipcardConsume)/100 + "元";
      }
    },{
      title: '微信充值金额',
      width: '100px',
      dataIndex: 'totalWechatRecharge',
      key: 'totalWechatRecharge',
      render: (totalWechatRecharge) => {
        return Math.round(totalWechatRecharge)/100 + "元";
      }
    },{
      title: '支付宝充值金额',
      width: '100px',
      dataIndex: 'totalAlipayRecharge',
      key: 'totalAlipayRecharge',
      render: (totalAlipayRecharge) => {
        return Math.round(totalAlipayRecharge)/100 + "元";
      }
    }]
  }
  componentDidMount() {
    this.fetch()
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'operationStatistics/listByMonth',
      payload: {
        data: {
          limit: 100
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
          rowKey='key'
          rowClassName={() => {}}
          scroll={{ x: 1000 }}
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
export default connect(mapStateToProps)(OperationStatisticsByMonth)
