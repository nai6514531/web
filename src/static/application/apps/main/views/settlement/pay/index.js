import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Promise from 'bluebird'
import moment from 'moment'
import billsService from '../../../services/bills'
import settlementService from '../../../services/settlement'
import { Popconfirm, Button, Modal, Form, Select, Table, Input, Checkbox, Col, Row, DatePicker, message } from 'antd'
const { RangePicker } = DatePicker
const { Option } = Select
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
    title: '结算管理'
  },
  {
    title: '微信结账'
  }
]

const alipayBreadItems = [
  {
    title: '结算管理'
  },
  {
    title: '支付宝结账'
  }
]

const BILLS_STATUS = {1:'等待结算', 2:'结算成功', 3:'结算中', 4:'结算失败'}

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
      dateType: 0
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
          return `${user.name} | ${user.mobile}`
        }
      },
      {
        title: '收款帐号',
        dataIndex: 'account',
        render: (account) => {
          return `${account.name} | ${account.payName}`
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
        render: (totalAmount) => {
          return `${totalAmount/100}`
        }
      },
      {
        title: '手续费',
        dataIndex: 'cast',
        render: (cast) => {
          return `${cast/100}`
        }
      },
      {
        title: '入账金额',
        dataIndex: 'amount',
        render: (amount) => {
          return `${amount/100}`
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (status) => {
          return BILLS_STATUS[status]
        }
      },
      {
        title: '结算时间',
        dataIndex: 'settledAt',
        render: (date) => {
          return date ? moment(date).format('YYYY-MM-DD HH:mm') : '-'
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          const disabled = !!~[0, 2, 3].indexOf(record.status)
          return (
            <span>
            <Popconfirm title='结算当前账单?' onConfirm={() => this.onPay([record.id])} className={disabled ? styles.hidden : ''}>
              <a href='#'>结算 </a>
            </Popconfirm>| 
            <Link to={`/admin/settlement/bills/${record.id}`}> 明细</Link> 
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
  componentWillMount () {
    this.alipayInfo = { selectedCount: 0}
  }
  getBills({...options}) {
    const pagination = _.extend(this.state.pagination, options.pagination || {})
    this.setState({ pagination: pagination , searchLoading: true, loading: true})
    const search = _.extend(pagination, this.state.search, options || {})
    billsService.get(search).then((res) => {
      if (res.status !== 'OK') {
        return new Promise.reject()
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
      this.setState({loading: false})
    })
  }
  onPay (bills) {
    const { type } = this.state.search
    settlementService.pay(bills).then((res) => {
      if (res.status !== 'OK') {
        return new Promise.reject(new Error(res.message || ''))
      }
      const data = res.data
      // 支付宝账单二次确认
      if (type === 1) {
        this.alipayInfo = data.alipay
        this.alipayInfo.selectedCount = bills.count
        this.setState({ alipayConfirmShow: true })
      }
      this.getBills()
      this.setState({ selectedPayLoading: false });
      message.info("结账操作成功。")
    }).catch((err) => {
      console.log(err)
      message.error('结帐操作异常，请稍后再试～')
      this.setState({loading: false})
    })
  }
  handleSelectedPay () {
    const bills = this.state.selectedRowKeys
    this.setState({ selectedPayLoading: true });
    this.onPay(bills)
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
    this.setState({search: {...this.state.search, keys: e.target.value}})
  }
  onSelectChange (selectedRowKeys) {
    this.setState({ selectedRowKeys: selectedRowKeys });
  }
  selectInit (record) {
    // 已结帐、结账中状态不可选
    return { disabled: !!~[0, 2, 3].indexOf(record.status)}
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
            <Option value=''>请选择结账状态</Option>
            <Option value='1'>等待结算</Option>
            <Option value='2'>已结账</Option>
            <Option value='3'>结账中</Option>
            <Option value='4'>结账失败</Option>
          </Select>
          <Select
            className={styles.item}
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
            className={styles.item}
          />
          <Input
            placeholder='运营名称／用户名'
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
          />
          <Modal
            title={null}
            wrapClassName={styles.alipay}
            footer={null}
            closable={false}
            visible={this.state.alipayConfirmShow}
            onCancel={this.hideConfirmShow.bind(this)}
          >
            <ConfirmForm changeModalVisible={this.hideConfirmShow.bind(this)} onCancel={this.hideConfirmShow.bind(this)} payInfo={this.alipayInfo || {}} />
          </Modal>
        </div>
      </div>
    )
  }
}

export default App
