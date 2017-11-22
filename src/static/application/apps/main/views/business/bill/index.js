import React, {  Component }from 'react'
import Promise from 'bluebird'
import _ from 'underscore'
import moment from 'moment'
import op from 'object-path'
import cx from 'classnames'
import querystring from 'querystring'

import { Button, Input, Table, Icon, message, Modal, Row, Col, Form } from 'antd'
const confirm = Modal.confirm
const FormItem = Form.Item

import Breadcrumb from '../../../components/layout/breadcrumb'
import history from '../../../utils/history'
import CONSTANT from '../constant'
import List from './list'
// import AccountForm from './edit-account-form.jsx'

import SettlementService from '../../../services/soda-manager/settlement'
import BillsService from '../../../services/soda-manager/bills'
import UserService from '../../../services/soda-manager/user'

import styles from './index.pcss'

const DATE_TYPE_IS_SETTLED_AT = 2

const breadItems = [
  {
    title: '商家系统'
  },
  {
    title: '结算查询'
  },
]
const PAEG_SIZE = 10

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      count: 0,
      totalAmount: 0,
      cashAccount: {
        type: 0
      },
      loading: false,
      bills: {
        list: [],
        loading: false,
        searchLoading: false
      },
      search: {
        dateType: DATE_TYPE_IS_SETTLED_AT,
        status: '', 
        startAt: '',
        endAt: ''
      },
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      },
      cashModalVisible: false
    }

    this.hasCashType = false
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)

    let search = _.pick(query, 'status', 'endAt', 'startAt')
    let pagination = _.pick(query, 'limit', 'offset')

    this.getBillsList({ search, pagination })
    this.getSettlementAmount()
  }
  settlementInfo() {
    Modal.info({
      title: '结算时间',
      content: (
        <div>
          <p>当日15:00前申请结算，可当日结算，否则顺延至第二天处理。</p>
          <p>系统自动申请结算的订单于当日结算完毕</p>
        </div>
      ),
      onOk() {},
    })
  }
  castInfo() {
    Modal.info({
      title: '手续费收取规则',
      content: (
        <div>
          <p>微信：收取结算金额的1%作为手续费；</p>
          <p>支付宝：200元以下每次结算收取2元手续费，200元及以上收取结算金额的1%作为手续费</p>
        </div>
      ),
      onOk() {},
    })
  }
  applySettlement() {
    let self = this
    let { totalAmount, count, cast, cashAccount: { type } } = this.state

    if (totalAmount <= 200) {
      return message.info('可结算金额必须超过2元才可结算')
    }
    if (type === CONSTANT.PAY_ACCOUNT_TYPE_IS_BANK) {
      return message.info('你当前收款方式为银行卡，不支持结算，请修改收款方式再进行结算操作。')
    }
    if (!this.hasCashType) {
      return message.info('你当前未设定收款方式，请修改收款方式再进行结算操作。')
    }
    
    confirm({
      title: '确认申请结算',
      content: <p className={styles.confimTip}>共有<span>{count}</span>天账单结算,结算金额为<span>{totalAmount/100}</span>元,本次结算将收取<span>{cast/100}</span>元手续费,是否确认结算？</p>,
      onOk() {
        self.createBill()
      },
      onCancel() {
      },
    })
  }
  createBill() {
    this.setState({ loading: true })
    BillsService.create().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({ totalAmount: 0, count: 0, cast: 0, loading: false })
      message.info('申请成功！财务将在1日内结算')
      this.getSettlementAmount()
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '申请结算失败！请重试')
    })
  }
  getSettlementAmount() {
    SettlementService.getDetail().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data } = res
      this.setState({ 
        totalAmount: data.totalAmount || 0, 
        count: data.count || 0, 
        cast: data.cast || 0 , 
        user: data.user || {}, 
        cashAccount: data.cashAccount || {} 
      })
      this.getBillsList()
    }).catch((err) => {
      message.error(err.message || '网络异常！请重试')
    })
  }
  getBillsList({...options}) {
    let search = options.search || {}
    let pagination = options.pagination || {}
    search = {...this.state.search, ...search}
    pagination = {...this.state.pagination, ...pagination}
    this.setState({ bills: { ...this.state.bills, loading: true, searchLoading: true }, search, pagination })

    BillsService.list({ ...search, ..._.pick(pagination, 'limit', 'offset') }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      const data = res.data
      this.setState({
        bills: {
          list: data.objects || [],
          loading: false,
          searchLoading: false
        },
        pagination: { 
          ...pagination, 
          total: data.pagination.total 
        }
      })
    }).catch((err) => {
      this.setState({ bills: { ...this.state.bills, loading: false, searchLoading: false } })
      message.error(err.message || '网络异常！请重试')
    })
  }
  dailyBillDetail() {
    this.props.history.push(`/business/bill/detail`)
  }
  handleCashModal(val) {
    if (val === 'success') {
      self.getSettlementAmount()
    }
    this.getUserDetail()
    this.setState({ cashModalVisible: false })
  }
  changeHistory ({...options}) {
    let query = _.pick({ ...this.state.search, ...this.state.pagination, ...options }, 'offset', 'limit', 'status', 'endAt', 'startAt')
    history.push(`/business/bill?${querystring.stringify(query)}`)
  }
  render() {
    const { cashAccount, user, bills } = this.state
    this.hasCashType = !!~[CONSTANT.PAY_ACCOUNT_TYPE_IS_ALIPAY, CONSTANT.PAY_ACCOUNT_TYPE_IS_WECHAT, CONSTANT.PAY_ACCOUNT_TYPE_IS_BANK].indexOf(cashAccount.type)
    const cashTypeIsWechat = cashAccount.type === CONSTANT.PAY_ACCOUNT_TYPE_IS_WECHAT
    
    return (<section className={styles.view}>
      <Breadcrumb items={breadItems} />
      <section className={styles.info}>
        <h2>结算操作</h2>
        <Row>
          <Col xs={24} lg={{span: 9}} className={styles.panelLeft}>
            <p>可结算金额（元）</p>
            <div>
              <span className={styles.amount}>{(this.state.totalAmount/100).toFixed(2)}</span> 
              <Button type='primary' onClick={this.applySettlement.bind(this)} disabled={this.state.loading}>申请结算</Button>
              {this.state.totalAmount !== 0 ? <Button onClick={this.dailyBillDetail.bind(this)}>明细</Button> : null}
            </div>
            <p>如已选择“自动结算”，结算金额超过200元系统将自动申请结算，详情请查看下方结算记录。</p>
          </Col>
          <Col xs={24} lg={{span: 13}} className={styles.cashAccount}>
            {
              cashAccount.type === CONSTANT.PAY_ACCOUNT_TYPE_IS_BANK ?  <Row>
                <Col xs={8} lg={{span: 5}}  span={4}>收款方式：</Col>
                <Col xs={16} lg={{span: 12}} span={10}>银行卡 <span className={styles.colorRed}>（不支持结算！）</span></Col>
              </Row> : null
            }
            { 
              cashAccount.type !== CONSTANT.PAY_ACCOUNT_TYPE_IS_BANK ? <Row >
                <Col xs={8} lg={{span: 5}}>收款方式：</Col>
                <Col  xs={16} lg={{span: 12}}>
                  {CONSTANT.PAY_ACCOUNT_TYPE[cashAccount.type] || '无'}
                  <span 
                    className={cx({ [`${styles.hidden}`]: !this.hasCashType, [`${styles.rule}`]: this.hasCashType })}
                    onClick={this.castInfo}>
                    手续费收取规则
                  </span>
                </Col>
              </Row> : null
            }
            {
              !cashTypeIsWechat ? <Row>
                <Col xs={8} lg={{span: 5}}>账号：</Col>
                <Col  xs={16} lg={{span: 12}}>{cashAccount.account || '无'}</Col>
              </Row> : null
            }
            {
              cashTypeIsWechat ?  <Row>
                <Col xs={8} lg={{span: 5}}>微信昵称：</Col>
                <Col  xs={16} lg={{span: 12}}>{op.get(user, 'nickName') || ''}</Col>
              </Row> : null
            }
            <Row>
              <Col xs={8} lg={{span: 5}}>姓名：</Col>
              <Col  xs={16} lg={{span: 12}}>{cashAccount.realName || '无'}</Col>
            </Row>
            <Row>
              <Col span={24}>
                <Button type='primary' 
                  onClick={() => { this.props.history.push(`/business/account/edit/${user.id}?type=cash&redirectUrl=${encodeURIComponent(`/business/bill`)}`) }}>
                  修改收款方式
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </section>
      <List 
        getBillsList={this.getBillsList.bind(this)} 
        bills={bills}
        search={this.state.search}
        cashAccount={cashAccount}
        hasCashType={this.hasCashType}
        pagination={this.state.pagination}
        changeHistory={this.changeHistory.bind(this)}
      />
      { 
        this.state.cashModalVisible ? <Modal
          wrapClassName={styles.modal}
          footer={null}
          style={{ top: 20 }}
          visible={this.state.cashModalVisible}
          onCancel={() => this.setState({ cashModalVisible:false })}
        >
        </Modal> : null
      }
      
    </section>)
  }
}

export default App
