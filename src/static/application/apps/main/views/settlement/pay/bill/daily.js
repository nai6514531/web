import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import billsService from '../../../../services/bills'
import { Popconfirm, Button, Modal, Form, Select, Table, Input, Checkbox, Col, Row, DatePicker, message } from 'antd'
const { RangePicker } = DatePicker
const { Option } = Select

import Breadcrumb from '../../../../components/layout/breadcrumb/'
import styles from '../index.pcss'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}
const wechatBreadItems = [
  {
    title: '财务系统'
  },
  {
    title: '结算管理',
  },
  {
    title: '微信结算',
    url: '#',
    handleClick: (e) => { e.preventDefault(); history.go(-1)}
  },
  {
    title: '账单明细'
  }
]

const alipayBreadItems = [
  {
    title: '财务系统'
  },
  {
    title: '结算管理',
  },
  {
    title: '支付宝结算',
    url: '#',
    handleClick: (e) => { e.preventDefault(); history.go(-1)}
  },
  {
    title: '账单明细'
  }
]
const BILLS_STATUS = {1:'等待结算', 2:'结算成功', 3:'结算中', 4:'结算失败'}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      bills: [],
      pagination: {
        total: 0,
        limit: 10,
        offset: 0
      },
      loading: false
    }
    this.columns = [
      {
        title: '账单号',
        dataIndex: 'id'
      },
      {
        title: '运营商',
        dataIndex: 'user',
        render: (user) => {
          return `${user.name}`
        }
      },
      {
        title: '金额',
        dataIndex: 'totalAmount',
        render: (totalAmount) => {
          return `${totalAmount/100}`
        }
      },
      {
        title: '收款方式',
        dataIndex: 'account',
        render: (account) => {
          return `${account.payName}`
        }
      },
      {
        title: '账期',
        dataIndex: 'billAt',
        render: (date) => {
          return moment(date).format('YYYY-MM-DD')
        }
      },
      {
        title: '帐户信息',
        dataIndex: 'account',
        key: 'account.id',
        render: (account, record) => {
          if (!!~[1].indexOf(account.type)) {
            return _.template([
              '<%- realName %>',
              '账号：<%- name %>',
              '手机号：<%- mobile %>'
              ].join(' | '))({
                realName: account.realName,
                name: account.name || '-',
                mobile: record.mobile || '-'
              })
          } 
          if (!!~[2].indexOf(account.type)) {
            return _.template([
              '<%- realName %>',
              ].join(' | '))({
                realName: account.realName,
                name: account.name || '-',
                mobile: record.mobile || '-'
              })
          } 
          return '-'
        }
      },
     
      {
        title: '订单量',
        dataIndex: 'count'
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (status) => {
          return BILLS_STATUS[status]
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          const type = !!~this.props.location.search.indexOf('alipay') ? 'alipay' : 
            !!~this.props.location.search.indexOf('wechat') ? 'wechat' : ''
          return (
            <Link to={`/admin/settlement/daily-bills/${record.id}?type=${type}`}>明细</Link> 
          )
        }
      }
    ]
  }
  componentDidMount () {
    this.getBillsDetail()
  }
  getBillsDetail({...options}) {
    const pagination = _.extend(this.state.pagination, options.pagination || {})
    const id = this.props.match.params.id
    const search = _.extend({id: id }, this.state.pagination, options)
    this.setState({ loading: true, pagination: pagination })
    billsService.getDetail(search).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data
      this.setState({
        bills: data.objects, 
        pagination: {
          ...pagination,
          total: data.pagination.total,
        }, 
        loading: false
      })
    }).catch((err) => {
      this.setState({loading: false})
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  render () {
    const self = this
    const type = !!~this.props.location.search.indexOf('alipay') ? 1 : 
                  !!~this.props.location.search.indexOf('wechat') ? 2 : 0
    const pagination = {
      total:this.state.pagination.total,
      showSizeChanger: true,
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pagination = {limit: pageSize, offset: (current - 1) * pageSize}
        self.getBillsDetail({pagination: pagination})
      },
      onChange(current, pageSize) {
        const pagination = {offset: (current - 1) * pageSize}
        self.getBillsDetail({pagination: pagination})
      }
    }
    return(
      <div className={styles.view}>
        <Breadcrumb items={type === 1 ? alipayBreadItems : wechatBreadItems} />
        <Table
          dataSource={this.state.bills || []}
          rowKey={record => record.id}
          columns={this.columns}
          loading={this.state.loading}
          pagination={pagination}
          className={styles.table}
        />
      </div>
    )
  }
}

export default App
