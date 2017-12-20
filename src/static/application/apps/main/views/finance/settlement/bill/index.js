import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Promise from 'bluebird'
import moment from 'moment'
import _ from 'underscore'
import querystring from 'querystring'
import { Button, Modal, Select, Table, Input, Col, Row, DatePicker, message, Icon } from 'antd'
const { confirm } = Modal
const { Option } = Select

import BillsService from '../../../../services/soda-manager/bills'
import SettlementService from '../../../../services/soda-manager/settlement'

import history from '../../../../utils/history'
import { conversionUnit } from '../../../../utils/functions'

import ConfirmForm from './alipay-confirm-form'
import Breadcrumb from '../../../../components/layout/breadcrumb'

import CONSTANT from '../../constant'

import styles from './index.pcss'

const PAEG_SIZE = 10

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

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      bills: [],
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      },
      search: {
        status: '',
        endAt: '',
        startAt: '',
        keys: '',
        type: 1,
        dateType: 1,
      },
      loading: false,
      searchLoading: false,
      exportLoading: false,
      alipayConfirmShow: false,
      selectedPayLoading: false,
      endOpen: false,
      selectedRowKeys: [],
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
        width: 135,
        render: (date) => {
          return moment(date).format('YYYY-MM-DD HH:mm')
        }
      },
      {
        title: '申请人',
        dataIndex: 'user',
        width: 130,
        render: (user) => {
          return `${user.name} | ${user.account}`
        }
      },
      {
        title: '收款账号',
        dataIndex: 'cashAccount',
        width: 130,
        render: (cashAccount, record) => {
          if (!!~[CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY].indexOf(cashAccount.type)) {
            return _.template([
              '<%- realName %>',
              '账号：<%- account %>'
              ].join(' | '))({
                realName: cashAccount.realName,
                account: cashAccount.account || '-',
              })
          }
          if (!!~[CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT].indexOf(cashAccount.type)) {
            return _.template([
              '<%- realName %>',
              ].join(' | '))({
                realName: cashAccount.realName,
              })
          }
          return '-'
        }
      },
      {
        title: '结算单号',
        dataIndex: 'id',
        width: 80,
      },
      {
        title: '账单天数',
        dataIndex: 'count',
        width: 50,
      },
      {
        title: '结算金额',
        dataIndex: 'totalAmount',
        width: 80,
        render: (value) => {
          return conversionUnit(value)
        }
      },
      {
        title: '手续费',
        dataIndex: 'cast',
        width: 60,
        render: (value) => {
          return conversionUnit(value)
        }
      },
      {
        title: '入账金额',
        dataIndex: 'amount',
        width: 80,
        render: (value) => {
          return conversionUnit(value)
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 90,
        render: (status) => {
          let label
          switch (status) {
            case CONSTANT.BILL_SETTLEMENT_STATUS_IS_WAITING:
              label = <span><i className={styles.waiting}></i>等待结算</span>
              break;
            case CONSTANT.BILL_SETTLEMENT_STATUS_IS_SUCCESS:
              label = <span><i className={styles.success}></i>结算成功</span>
              break;
            case CONSTANT.BILL_SETTLEMENT_STATUS_IS_PAYING:
              label = <span><i className={styles.paying}></i>结算中</span>
              break;
            case CONSTANT.BILL_SETTLEMENT_STATUS_IS_FAIL:
              label = <span><i className={styles.fail}></i>结算失败</span>
              break;
            default:
              label = <span>-</span>
              break;
          }
          return <p className={styles.status}>{label}</p>
        }
      },
      {
        title: '结算时间',
        dataIndex: 'settledAt',
        width: 135,
        render: (date, record) => {
          return date && record.status === CONSTANT.BILL_SETTLEMENT_STATUS_IS_SUCCESS ? moment(date).format('YYYY-MM-DD HH:mm') : '-'
        }
      },
      {
        title: '是否自动结算',
        width: 70,
        render: (record) => {
          return record.isAuto ? '自动结算' : '手动结算'
        }
      },
      {
        title: '操作',
        key: 'operation',
        width: 90,
        render: (text, record, index) => {
          const disabled = !!~[CONSTANT.BILL_SETTLEMENT_STATUS_IS_DEFAULT, CONSTANT.BILL_SETTLEMENT_STATUS_IS_SUCCESS, CONSTANT.BILL_SETTLEMENT_STATUS_IS_PAYING, CONSTANT.BILL_SETTLEMENT_STATUS_IS_FAIL].indexOf(record.status)
          const type = !!~this.props.location.pathname.indexOf('alipay') ? 'alipay' :
            !!~this.props.location.pathname.indexOf('wechat') ? 'wechat' : ''
          const count = record.count / 100
          return (
            <span>
              <a onClick={this.handlePay.bind(this, record)} className={disabled ? styles.hidden : ''}>结算 |</a>
            <Link to={`/finance/settlement/bills/${record.id}?type=${type}`}> 明细</Link>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount () {
    let payType = !!~this.props.location.pathname.indexOf('alipay') ? CONSTANT.BILL_SETTLEMENT_STATUS_IS_WAITING :
                    !!~this.props.location.pathname.indexOf('wechat') ? CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT : 0

    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)

    let search = _.extend(_.pick(query, 'status', 'endAt', 'startAt', 'keys', 'dateType'), {type: payType})
    let pagination = _.pick(query, 'limit', 'offset')

    this.setState({search: {...this.state.search, ...search}, pagination: { ...this.state.pagination, pagination}})
    this.getBills({...search, pagination: pagination})
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
    let search = _.clone(this.state.search)
    options = _.pick(options, 'status', 'endAt', 'startAt', 'keys', 'type', 'dateType')
    search = _.extend(search, options  || {})

    search.startAt= search.startAt ? moment(search.startAt).format() : ''
    search.endAt= search.endAt ? moment(search.endAt).format() : ''

    this.setState({searchLoading: true, loading: true})

    BillsService.list({...search, ...pagination}).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data
      this.setState({
        bills: data.objects || [],
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
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  onPay () {
    const { type } = this.state.search
    this.setState({ selectedPayLoading: true });
    SettlementService.pay(this.state.billsId).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data
      // 支付宝账单二次确认
      if (type === CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY) {
        this.alipayInfo = data
        this.setState({ alipayConfirmShow: true, payConfirmShow: false })
      }
      this.getBills()
      this.setState({ selectedPayLoading: false, payConfirmShow: false })
      message.info("结算操作成功。")
    }).catch((err) => {
      this.setState({loading: false, selectedPayLoading: false, payConfirmShow: false})
      message.error(err.message || '结账操作异常，请稍后再试～')
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
    this.setState({payConfirmShow: true, confirmPay: { count: 1, amount: bill.amount/100}, billsId: [bill.id]})
  }
  hidePayConfirm() {
    this.setState({payConfirmShow: false})
  }
  search () {
    const { search } = this.state
    if (!!search.startAt && !search.endAt) {
      return message.info('请选择结束日期')
    }
    this.getBills({ pagination: { offset: 0 } })
    this.changeHistory()
  }
  changeDateType (value) {
    const { search } = this.state
    const type = +value
    this.setState({ search: { ...search, dateType: type } })
  }
  changeKeys (e) {
    const val = e.target.value
    this.setState({ search: { ...this.state.search, keys: val.replace(/(^\s+)|(\s+$)/g,"") } })
  }
  emitKeysEmpty() {
    this.refs.keysInput.focus();
    this.setState({ search: { ...this.state.search, keys: '' } })
  }
  onSelectChange (selectedRowKeys) {
    this.setState({ selectedRowKeys: selectedRowKeys })
  }
  selectInit (record) {
    // 已结账、结算中、失败状态不可选
    return { disabled: !!~[CONSTANT.BILL_SETTLEMENT_STATUS_IS_DEFAULT, CONSTANT.BILL_SETTLEMENT_STATUS_IS_SUCCESS, CONSTANT.BILL_SETTLEMENT_STATUS_IS_PAYING, CONSTANT.BILL_SETTLEMENT_STATUS_IS_FAIL].indexOf(record.status) }
  }
  hideConfirmShow () {
    this.setState({alipayConfirmShow: false})
  }
  onChangeDate (field, value) {
    const search = _.extend(this.state.search, { endAt: !!value ? moment(value).format('YYYY-MM-DD') : ''}, {[field]: !!value ? moment(value).format('YYYY-MM-DD') : ''})
    this.setState({search: search});
  }
  onStartChange (value) {
    this.onChangeDate('startAt', value);
  }
  onEndChange (value) {
    this.onChangeDate('endAt', value);
  }
  disabledStartDate (current) {
    return current && current.valueOf() > Date.now();
  }
  disabledEndDate (current) {
    const second = 31 * 24 * 60 * 60 * 1000;
    const startAt = this.state.search.startAt ? moment(this.state.search.startAt).valueOf() : '';
    if (!startAt) {
      return true;
    }
    // 结束时间和开始时间跨度　大于等于３1天
    // 获取截至结束时间
    const endDate =  Date.now() < startAt + second ? Date.now() : startAt + second
    return current && current.valueOf() < startAt || current && current.valueOf() > endDate
  }
  handleStartOpenChange (open) {
    if (!open) {
      this.setState({
        endOpen: true
      });
    }
  }
  handleEndOpenChange (open) {
    this.setState({
      endOpen: open
    });
  }
  exportBills() {
    const self = this
    let { search } = this.state
    if (!search.startAt || !search.endAt) {
      return message.info('请选择导出账单日期～')
    }
    confirm({
      title: '是否导出这批账单',
      content: '',
      onOk() {
        self.setState({exportLoading: true})
        BillsService.export(self.state.search).then((res) => {
          if (res.status !== 'OK') {
            throw new Error(res.message)
          }
          window.open(res.data.url);
          self.setState({exportLoading: false})
        }).catch((err) => {
          self.setState({exportLoading: false})
          message.error(err.message || '导出失败,请重试～')
          console.log(err)
        })
      },
      onCancel() {
      },
    })
  }
  reset() {
    const payType = !!~this.props.location.pathname.indexOf('alipay') ? CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY :
                    !!~this.props.location.pathname.indexOf('wechat') ? CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT : 0
    const options = {
      search: {
        status: '',
        endAt: '',
        startAt: '',
        keys: '',
        type: payType,
        dateType: 1,
      },
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      }
    }
    this.setState({
      ...this.state,
      ...options
    })
    this.getBills({...options.search, pagination: options.pagination})
    this.changeHistory({...options.search, pagination: options.pagination})
  }
  changeHistory (options) {
    let payType = !!~this.props.location.pathname.indexOf('alipay') ? 'alipay' :
      !!~this.props.location.pathname.indexOf('wechat') ? 'wechat' : ''
    let search = _.clone(this.state.search)
    let pagination = _.clone(this.state.pagination)
    options = _.extend(search, pagination, options)

    let query = querystring.stringify(_.pick(options, 'offset', 'limit', 'status', 'endAt', 'startAt', 'keys', 'dateType', 'keys'))
    this.props.history.push(`/finance/settlement/${payType}?${query}`)
  }
  render () {
    const self = this
    const { selectedPayLoading, selectedRowKeys } = this.state
    const { type, keys, startAt, endAt, dateType } = this.state.search
    const keysInputSuffix = keys ? <Icon type='close-circle' onClick={this.emitKeysEmpty.bind(this)} className={styles.close} /> : null;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
      getCheckboxProps: this.selectInit.bind(this)
    }
    const selectedCount = selectedRowKeys.length
    const hasSelected = selectedCount > 0
    const pagination = {
      total: this.state.pagination.total,
      current: parseInt(this.state.pagination.offset / this.state.pagination.limit) + 1,
      pageSize: parseInt(this.state.pagination.limit, 10),
      showSizeChanger: true,
      pageSizeOptions: ['10', '50', '100', '200'],
      showTotal (total) {
        return <span>总计 {total} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = {limit: pageSize, offset: offset}
        self.changeHistory(pagination)
        self.getBills({pagination: pagination})
      },
      onChange(current, pageSize) {
        let offset = (current - 1) * pageSize
        let pagination = {offset: offset}
        self.changeHistory(pagination)
        self.getBills({pagination: pagination})
      }
    }

    return(
      <div className={styles.view}>
        <Breadcrumb items={type === CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY ? alipayBreadItems : wechatBreadItems} />
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
            value={this.state.search.status}
            style={{width: 120}}
            onChange={(value) => { this.setState({search: {...this.state.search, status: value}})}}>
            <Option value=''>请选择结算状态</Option>
            <Option value='1'>等待结算</Option>
            <Option value='2'>结算成功</Option>
            <Option value='3'>结算中</Option>
            <Option value='4'>结算失败</Option>
          </Select>
          <div className={styles.group}>
            <Select
              value={dateType + ''}
              style={{width: 120, marginBottom: 10 }}
              onChange={this.changeDateType.bind(this)}>
              <Option value='1'>申请时间</Option>
              <Option value='2'>结算时间</Option>
            </Select>
            <DatePicker
            style={{width:120,marginLeft:10, marginBottom: 10}}
            value={!!startAt ? moment(startAt) : null}
            format="YYYY-MM-DD"
            disabledDate={this.disabledStartDate}
            placeholder="开始日期"
            onChange={this.onStartChange.bind(this)}
            onOpenChange={this.handleStartOpenChange.bind(this)}
          />
          -
          <DatePicker
            style={{width:120, marginRight:4, marginBottom: 10}}
            disabledDate={this.disabledEndDate.bind(this)}
            placeholder="结束日期"
            format="YYYY-MM-DD"
            value={!!endAt ? moment(endAt) : null}
            onChange={this.onEndChange.bind(this)}
            open={this.state.endOpen}
            onOpenChange={this.handleEndOpenChange.bind(this)}
          />
          </div>
          <Input
            placeholder='运营商名称 / 登录账号'
            style={{ width: 200, marginRight:10, marginBottom: 10, verticalAlign: 'top'}}
            onChange={this.changeKeys.bind(this)}
            value={keys}
            onPressEnter={this.search.bind(this)}
            suffix={keysInputSuffix}
            ref='keysInput'
           />
          <Button type='primary' icon='search' onClick={this.search.bind(this)}
            loading={this.state.searchLoading} className={styles.button}>筛选</Button>
          <Button type='primary' icon='download' onClick={this.exportBills.bind(this)} loading={this.state.exportLoading} className={styles.button}>导出</Button>
          <Button onClick={this.reset.bind(this)} className={styles.button}>重置</Button>
          <Table
            rowSelection={rowSelection}
            dataSource={this.state.bills || []}
            rowKey={record => record.id}
            columns={this.columns}
            loading={this.state.loading}
            pagination={pagination}
            className={styles.table}
            scroll={{ x: 1000, y: 800 }}
          />
          <Modal
            title={null}
            wrapClassName={styles.alipay}
            footer={null}
            closable={false}
            maskClosable={true}
            visible={this.state.alipayConfirmShow}
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
              已选<i className={styles.red}>{this.state.confirmPay.count}</i>个订单，共<i className={styles.red}>{this.state.confirmPay.amount}</i>元进行结算，确认结算吗？
            </p>
            <div className={styles.button}>
              <Button type="primary" size="large" disabled={selectedPayLoading} style={{ marginRight: '10px'}} onClick={this.hidePayConfirm.bind(this)}>
                取消
              </Button>
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
