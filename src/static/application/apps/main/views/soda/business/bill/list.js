import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment'
import { Affix, Button, Input, Table, Icon, Select, DatePicker, Breadcrumb, message, Modal } from 'antd'
const { Option } = Select
const { confirm } = Modal
import { Link } from 'react-router-dom'

import BillsService from '../../../../services/soda-manager/bills'
import { conversionUnit } from '../../../../utils/functions'

import CASH_ACCOUNT from '../../../../constant/cash-account'
import BILL from '../../../../constant/bill'

import styles from './index.pcss'

const PAEG_SIZE = 10

class App extends Component {
  constructor(props) {
    super(props)
    let { search } = this.props

    this.state = {
      search: {
        status: search.status,
        startAt: search.startAt,
        endAt: search.endAt
      },
      endOpen: false,
      loading: false,
    }
    this.columns = [
      {
        title: '账单天数',
        dataIndex: 'count',
        width: 50,
        render: (count, record) => {
          return <Link to={`/soda/business/bill/${record.id}`}>{count}</Link>
        }
      }, {
        title: '收款账号',
        render: (record) => {
          let { cashAccount: { realName, account, type } } = record

          if (!!~[CASH_ACCOUNT.TYPE_IS_ALIPAY].indexOf(type)) {
            return _.without([`支付宝`, `${realName}`, `账号:${account || '-'}`], '').join(' | ')
          } 
          if (!!~[CASH_ACCOUNT.TYPE_IS_WECHAT].indexOf(type)) {
            return _.without([`微信`, `${realName}`], '').join(' | ')
          } 
          return '-'
        }
      }, {
        title: '结算金额',
        dataIndex: 'totalAmount',
        render: (totalAmount) => {
          return conversionUnit(totalAmount)
        }
      }, {
        title: '手续费',
        dataIndex: 'cast',
        render: (cast) => {
          return conversionUnit(cast)
        }
      },{
        title: '入账金额',
        dataIndex: 'amount',
        render: (amount) => {
          return conversionUnit(amount)
        }
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (status, record) => {
        	let label
          switch (status) {
            case BILL.SETTLEMENT_STATUS_IS_DEFAULT:
              label = <span>未申请结算</span>
              break;
            case BILL.SETTLEMENT_STATUS_IS_WAITING:
              label = <span><i className={styles.waiting}></i>等待结算</span>
              break;
            case BILL.SETTLEMENT_STATUS_IS_SUCCESS:
              label = <span><i className={styles.success}></i>结算成功</span>
              break;
            case BILL.SETTLEMENT_STATUS_IS_PAYING:
              label = <span><i className={styles.paying}></i>结算中</span>
              break;
            case BILL.SETTLEMENT_STATUS_IS_FAIL:
          		label = <span>结算失败<Icon type='question-circle' className={styles.failIcon}　onClick={this.showFailInfo} /></span>
              break;
            default:
              label = <span>-</span>
              break;
          }
          return <p className={styles.status}>{label}</p>
        }
      }, {
        title: '结算时间',
        dataIndex: 'settledAt',
        render: (date, record) => {
          return date && record.status === BILL.SETTLEMENT_STATUS_IS_SUCCESS ? moment(date).format('YYYY-MM-DD HH:mm') : '-'
        }
      }, {
        title: '操作',
        key: 'method',
        render: (record) => {
          const id = record.id
          const status = record.status
          if (!!~[BILL.SETTLEMENT_STATUS_IS_FAIL].indexOf(status)) {
            return <span>
              <a onClick={this.handleSettlemenet.bind(this, id)}>重新申请</a>
              <span className={styles.divider}>|</span>
              <Link to={`/soda/business/bill/${id}`}>明细</Link>
            </span>
          } else {
            return <span>
              <Link to={`/soda/business/bill/${id}`}>明细</Link>
            </span> 
          }
        }
      }
    ]
  }
  search() {
    let { search } = this.state
    let pagination = { offset: 0 }

    if (!!search.startAt && !search.endAt) {
      return message.info('请选择时间')
    }

    this.props.changeHistory({...pagination, ...search})
    this.props.getBillsList({search, pagination})
  }
  showFailInfo() {
    Modal.info({
      content: (
        <div>
          <p>有结账失败记录很有可能是收款账号和姓名不匹配，请检查后修改收款方式。</p>
        </div>
      ),
      onOk() {},
    })
  }
  handleSettlemenet(id) {
    let self = this
    let { cashAccount: { type }, bills: { list }, hasCashType } = this.props
    let { loading } = this.state
    let bill = _.findWhere(list, { id: id })

    if (loading) {
      return
    }
    if (bill.totalAmount <= 200) {
      return message.info('可结算金额必须超过2元才可结算')
    }
    if (type === CASH_ACCOUNT.TYPE_IS_BANK) {
      return message.info('你当前收款方式为银行卡，不支持结算，请修改收款方式再进行结算操作。')
    }
    if (!hasCashType) {
      return message.info('你当前未设定收款方式，请修改收款方式再进行结算操作。')
    }

    BillsService.getCast(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let cast = res.data.cast
      confirm({
        title: '确认重新申请结算',
        content: <p className={styles.confimTip}>共有<span>{bill.count}</span>天账单结算，结算金额为<span>{conversionUnit(bill.totalAmount)}</span>元，本次结算将收取<span>{cast/100}</span>元手续费，是否确认结算？</p>,
        onOk() {
          self.updateBill(id)
        },
        onCancel() {
        },
      })
    }).catch((err) => {
      message.error(err.message || '申请结算失败！请重试')
    })
  }
  updateBill(id) {
    this.setState({ loading: true })

    BillsService.update(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      message.info('申请成功！财务将在1日内结算')
      this.setState({ loading: false })
      this.props.getBillsList({ search: this.state.search })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '申请结算失败！请重试')
    })
}
  onChangeDate (field, value) {
    const date = moment(moment(value).format('YYYY-MM-DD')).format()
    //　更新开始时间，则触发结束时间,保持与其一致
    const search = { ...this.state.search, endAt: !!value ? date : '', [field]: !!value ? date : '' }
    this.setState({ search: search });
  }
  onStartChange(value) {
    this.onChangeDate('startAt', value)
  }
  onEndChange(value) {
    this.onChangeDate('endAt', value)
  }
  disabledStartDate(current) {
    return current && current.valueOf() > Date.now()
  }
  disabledEndDate(current) {
    const second = 31 * 24 * 60 * 60 * 1000
    const { search } = this.state
    const startAt = !!search.startAt ? moment(search.startAt).valueOf() : ''
    if (!startAt) {
      return true
    }
    
    // 结束时间和开始时间跨度　大于等于３1天
    // 获取截至结束时间
    const endDate =  Date.now() < startAt + second ? Date.now() : startAt + second
    return current && current.valueOf() < startAt || current && current.valueOf() > endDate
  }
  handleStartOpenChange(open) {
    if (!open) {
      this.setState({
        endOpen: true
      })
    }
  }
  handleEndOpenChange(open) {
    this.setState({
      endOpen: open
    })
  }
  pagination () {
    let self = this
    let { pagination: { total, offset, limit } } = this.props
    return {
      total: total,
      current: parseInt(offset / limit) + 1,
      pageSize: parseInt(limit, 10),
      showSizeChanger: true,
      pageSizeOptions: ['10', '50', '100', '200'],
      showTotal (data) {
        return <span>总计 {data} 条</span>
      },
      onShowSizeChange(current, pageSize) {
        let { search } = self.state
        let offset = (current - 1) * pageSize
        let pagination = { limit: pageSize, offset: offset }
        self.props.changeHistory({...pagination, ...search})
        self.props.getBillsList({pagination, search})
      },
      onChange(current, pageSize) {
        let { search } = self.state
        let offset = (current - 1) * pageSize
        let pagination = { offset: offset }
        self.props.changeHistory({...pagination, ...search})
        self.props.getBillsList({pagination, search})
      }
    }
  }
  render() {
    let self = this
    let { bills: { list, loading, searchLoading} } = this.props
    let { search: { startAt, endAt, status }, endOpen } = this.state 

    return (<section className={styles.list}>
      <h2>结算记录</h2>
      <div className={styles.panel}>
        <DatePicker
          placeholder="开始日期"
          format="YYYY-MM-DD"
          style={{ width: 120, marginRight: 5, marginBottom: 10 }}
          value={!!startAt ? moment(startAt) : null}
          disabledDate={this.disabledStartDate.bind(this)}
          onChange={this.onStartChange.bind(this)}
          onOpenChange={this.handleStartOpenChange.bind(this)}
        />
        -
        <DatePicker
          placeholder="结束日期"
          format="YYYY-MM-DD"
          style={{ width: 120, marginLeft: 5, marginRight: 10, marginBottom: 10 }}
          value={!!endAt ? moment(endAt) : null}
          open={endOpen}
          disabledDate={this.disabledEndDate.bind(this)}
          onChange={this.onEndChange.bind(this)}
          onOpenChange={this.handleEndOpenChange.bind(this)}
        />
        <Select
          defaultValue={status}
          style={{ width: 150, marginRight: 10, marginBottom: 10 }}
          onChange={(value) => { this.setState({search: {...this.state.search, status: value}})}}>
          <Option value=''>请选择结算状态</Option>
          <Option value='1'>等待结算</Option>
          <Option value='3'>结算中</Option>
          <Option value='2'>结算成功</Option>
          <Option value='4'>结算失败</Option>
        </Select>
        <Button type='primary' icon='search' style={{ marginBottom: 10 }} loading={searchLoading} onClick={this.search.bind(this)}>筛选</Button>
      </div>
      <Table columns={this.columns}
        scroll={{ x: 500 }}
        style={{ marginBottom: 10, marginTop: 16 }}
        rowKey={record => record.id}
        dataSource={list}
        pagination={this.pagination.call(this)}
        loading={loading}
      />
      <p className={styles.tip}>注意：1. 入账金额=结算金额-手续费；2. 若有结账失败记录很有可能是收款账号和姓名不匹配，请检查后修改收款方式；</p>
    </section>)
  }
}

export default App
