import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Promise from 'bluebird'
import moment from 'moment'
import _ from 'underscore'
import billsService from '../../../services/bills'
import settlementService from '../../../services/settlement'
import { Popconfirm, Button, Modal, Form, Select, Table, Input, Checkbox, Col, Row, DatePicker, message, Icon } from 'antd'
const confirm = Modal.confirm;
const { RangePicker } = DatePicker
const { Option } = Select
const InputGroup = Input.Group
import ConfirmForm from './alipay-confirm-form'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import styles from './index.pcss'

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
    title: '结算管理'
  },
  {
    title: '微信结算'
  }
]

const alipayBreadItems = [
  {
    title: '财务系统'
  },
  {
    title: '结算管理'
  },
  {
    title: '支付宝结算'
  }
]

const BILLS_STATUS = {1: '等待结算', 2: '结算成功', 3: '结算中', 4: '结算失败'}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      bills: [],
      pagination: {
        total: 0,
        limit: 10,
        offset: 0
      },
      search: {
        status: '',
        createdAt: '',
        settledAt: '',
        keys: '',
        type: 1
      },
      loading: false,
      searchLoading: false,
      alipayConfirmShow: false,
      selectedPayLoading: false,
      selectedRowKeys: [],
      dateType: 0,
      payConfirmShow: false,
      confirmPay: {
        count: 0,
        amount: 0
      },
      billsId: []
    }
    this.columns = [
      {
        title: '申请时间',
        dataIndex: 'createdAt',
        render: (date) => {
          return moment(date).format('YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '申请人',
        dataIndex: 'user',
        render: (user) => {
          return `${user.name} | ${user.accountName}`
        }
      },
      {
        title: '收款账号',
        dataIndex: 'account',
        render: (account, record) => {
          if (!!~[1].indexOf(account.type)) {
            return _.template([
              '<%- realName %>',
              '账号：<%- name %>'
              ].join(' | '))({
                realName: account.realName,
                name: account.name || '-'
              })
          } 
          if (!!~[2].indexOf(account.type)) {
            return _.template([
              '<%- realName %>',
              ].join(' | '))({
                nickName: record.user.nickName || '-',
                realName: account.realName,
                name: account.name || '-'
              })
          } 
          return '-'
        }
      },
      {
        title: '结算单号',
        dataIndex: 'id'
      },
      {
        title: '账单天数',
        dataIndex: 'count'
      },
      {
        title: '结算金额',
        dataIndex: 'totalAmount',
        render: (data) => {
          return `${(data/100).toFixed(2)}`
        }
      },
      {
        title: '手续费',
        dataIndex: 'cast',
        render: (data) => {
          return `${(data/100).toFixed(2)}`
        }
      },
      {
        title: '入账金额',
        dataIndex: 'amount',
        render: (data) => {
          return `${(data/100).toFixed(2)}`
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 90,
        render: (status) => {
          if (status === 4) {
            return <p className={styles.fail}><span>{BILLS_STATUS[status]}</span><Icon type='question-circle' onClick={this.showFailInfo.bind(this)} /></p>
          }
          return BILLS_STATUS[status]
        }
      },
      {
        title: '结算时间',
        dataIndex: 'settledAt',
        render: (date, record) => {
          return date && record.status === 2 ? moment(date).format('YYYY-MM-DD HH:mm') : '-'
        }
      },
      {
        title: '是否自动结算',
        render: (record) => {
          return record.isMode === 0 ? '自动结算' : '手动结算'
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          const disabled = !!~[0, 2, 3, 4].indexOf(record.status)
          const type = !!~this.props.location.pathname.indexOf('alipay') ? 'alipay' : 
            !!~this.props.location.pathname.indexOf('wechat') ? 'wechat' : ''
          const count = record.count / 100
          return (
            <span>
              <a onClick={this.handlePay.bind(this, record)} className={disabled ? styles.hidden : ''}>结算 |</a>
            <Link to={`/admin/settlement/bills/${record.id}?type=${type}`}> 明细</Link> 
            </span>
          )
        }
      }
    ]
  }
  componentDidMount () {
    const payType = !!~this.props.location.pathname.indexOf('alipay') ? 1 : 
                    !!~this.props.location.pathname.indexOf('wechat') ? 2 : 0
    this.setState({search: {...this.state.search, type: payType}})
    this.getBills({type: payType})
  }
  showFailInfo () {
    Modal.info({
      content: (
        <div>
          <p>有结账失败记录很有可能是收款账号和姓名不匹配，请检查后修改收款方式。</p>
        </div>
      ),
      onOk() {},
    });
  }
  getBills({...options}) {
    const pagination = _.extend(this.state.pagination, options.pagination || {})
    this.setState({ pagination: pagination , searchLoading: true, loading: true})
    const search = _.extend(pagination, this.state.search, options || {})
    billsService.get(search).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data
      this.setState({
        bills: data.objects, 
        selectedRowKeys: [],
        pagination: {
          ...pagination,
          total: data.pagination.total
        }, 
        searchLoading: false, 
        loading: false
      })
    }).catch((err) => {
      this.setState({loading: false, searchLoading: false})
    })
  }
  onPay () {
    const { type } = this.state.search
    console.log(this.state.billsId)
    this.setState({ selectedPayLoading: true });
    settlementService.pay(this.state.billsId).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data
      // 支付宝账单二次确认
      if (type === 1) {
        this.alipayInfo = data 
        this.setState({ alipayConfirmShow: true, payConfirmShow: false })
      }
      this.getBills()
      this.setState({ selectedPayLoading: false, payConfirmShow: false })
      message.info("结算操作成功。")
    }).catch((err) => {
      message.error(err.message || '结账操作异常，请稍后再试～')
      this.setState({loading: false, selectedPayLoading: false, payConfirmShow: false})
    })
  }
  handleSelectedPay () {
    const billsId = this.state.selectedRowKeys
    const bills =  _.filter(this.state.bills, (bill) => { return !!~billsId.indexOf(bill.id) })
    const amount = _.chain(bills).pluck('amount').reduce((memo, num) => { return memo + num; },  0).value()
    const count = bills.length
    this.setState({payConfirmShow: true, confirmPay: { count: count, amount: amount/100}, billsId: billsId})
  }
  handlePay (bill) {
    this.setState({payConfirmShow: true, confirmPay: { count: bill.count, amount: bill.amount/100}, billsId: [bill.id]})
  }
  search () {
    this.getBills()
  }
  disabledDate (current) {
    // Can not select days after today and today
    return current && current.valueOf() > Date.now();
  }
  changeDate (date, dateString) {
    const type = this.state.dateType
    date = date ? moment(date).format() : '' 
    this.changeSearchDate(type, date)
  }
  changeDateType (value) {
    const { search } = this.state
    const date = search.settledAt || search.createdAt
    const type = +value
    this.setState({dateType: type})
    this.changeSearchDate(type, date)
  }
   changeSearchDate (type, date) {
    if (type === 1) {
      this.setState({search: {...this.state.search, settledAt: '', createdAt: date}})
    } else if (type === 2) {
      this.setState({search: {...this.state.search, settledAt: date, createdAt: ''}})
    } else {
      // 没有选择筛选日期类型，默认为申请时间
      this.setState({search: {...this.state.search, settledAt: '', createdAt: date}})
    }
  }
  changeKeys (e) {
    const val = e.target.value
    this.setState({search: {...this.state.search, keys: val.replace(/(^\s+)|(\s+$)/g,"")}})
  }
  onSelectChange (selectedRowKeys) {
    this.setState({ selectedRowKeys: selectedRowKeys });
  }
  selectInit (record) {
    // 已结账、结算中状态不可选
    return { disabled: !!~[0, 2, 3, 4].indexOf(record.status)}
  }
  hideConfirmShow () {
    this.setState({alipayConfirmShow: false})
  }
  render () {
    const self = this
    const { selectedPayLoading, selectedRowKeys } = this.state
    const { type } = this.state.search
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
      getCheckboxProps: this.selectInit.bind(this)
    }
    const selectedCount = selectedRowKeys.length
    const hasSelected = selectedCount > 0
    const pagination = {
      total: this.state.pagination.total,
      showSizeChanger: true,
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        const pagination = {limit: pageSize, offset: (current - 1) * pageSize}
        self.getBills(pagination)
      },
      onChange(current, pageSize) {
        const pagination = {offset: (current - 1) * pageSize}
        self.getBills(pagination)
      }
    }
    return(
      <div className={styles.view}>
        <Breadcrumb items={type === 1 ? alipayBreadItems : wechatBreadItems} />
        <div>
          <Button
              type="primary"
              onClick={this.handleSelectedPay.bind(this)}
              disabled={!hasSelected}
              loading={selectedPayLoading}
            >
              结算
            </Button>
            <span style={{ marginLeft: 8, marginRight: 8 }}>
              {hasSelected ? `已选 ${selectedCount} 账单` : ''}
            </span>
          <Select
            className={styles.item}
            defaultValue={this.state.search.status}
            style={{width: 120 }}
            onChange={(value) => { this.setState({search: {...this.state.search, status: value}})}}>
            <Option value=''>请选择结算状态</Option>
            <Option value='1'>等待结算</Option>
            <Option value='2'>结算成功</Option>
            <Option value='3'>结算中</Option>
            <Option value='4'>结算失败</Option>
          </Select>
          <div className={styles.group}>
            <InputGroup compact>
              <Select
                defaultValue={this.state.dateType + ''}
                style={{width: 120 }}
                onChange={this.changeDateType.bind(this)}>
                <Option value='0'>申请时间／结算时间</Option>
                <Option value='1'>申请时间</Option>
                <Option value='2'>结算时间</Option>
              </Select>
              <DatePicker
                disabledDate={this.disabledDate}
                placeholder="时间"
                onChange={this.changeDate.bind(this)}
              />
            </InputGroup>
          </div>
          <Input
            placeholder='运营商名称 / 登录账号'
            style={{ width: 200 }}
            className={styles.item}
            onChange={this.changeKeys.bind(this)}
           />
          <Button type='primary' icon='search' onClick={this.search.bind(this)} 
            loading={this.state.searchLoading}>搜索</Button>
          <Table
            rowSelection={rowSelection}
            dataSource={this.state.bills || []}
            rowKey={record => record.id}
            columns={this.columns}
            loading={this.state.loading}
            pagination={pagination}
            className={styles.table}
            scroll={{ x: 1000 }}
          />
          <Modal
            title={null}
            wrapClassName={styles.alipay}
            footer={null}
            closable={false}
            maskClosable={true}
            visible={this.state.alipayConfirmShow}
            onCancel={this.hideConfirmShow.bind(this)}
          >
            <ConfirmForm changeModalVisible={this.hideConfirmShow.bind(this)} onCancel={this.hideConfirmShow.bind(this)} payInfo={this.alipayInfo || {}} />
          </Modal>
          <Modal
            visible={this.state.payConfirmShow}
            title=""
            footer={null}
            closable={false}
            maskClosable={true}
            className={styles.modal}
          >
            <p>
              <Icon type="exclamation-circle" className={styles.icon}/>
              已选<i className={styles.red}>{this.state.confirmPay.count}</i>个订单，共<i className={styles.red}>{this.state.confirmPay.amount}</i>元进行结算，确认结算吗
            </p>
            <div className={styles.button}>
              <Button key="submit" type="primary" size="large" loading={selectedPayLoading} onClick={this.onPay.bind(this)}>
                确认
              </Button>
             </div> 
          </Modal>
        </div>
      </div>
    )
  }
}

export default App
