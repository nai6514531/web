import React, {  Component }from 'react'
import { connect } from 'dva'
import Promise from 'bluebird'
import _ from 'underscore'
import moment from 'moment'
import op from 'object-path'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import { Table, Button, message, Row, Col, Card } from 'antd'

import { InputClear } from '../../../components/form/input'
import UserService from '../../../services/soda-manager/user'
import ChipcardService from '../../../services/soda-manager/chipcard'
import history from '../../../utils/history'
import CASH_ACCOUNT from '../../../constant/cash-account'
import Breadcrumb from '../../../components/layout/breadcrumb'

import styles from './index.pcss'

const PAEG_SIZE = 10

const breadItems = [
  {
    title: '账号管理'
  },
  {
    title: '个人信息'
  }
]

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      isPermissionRecharge: false,
      loading: false
    }
  }
  componentWillMount() {
    this.detail()
    this.cashAccount()
    this.getisRechargePermission()
  }
  getisRechargePermission() {
    ChipcardService.getRechargePermission().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        isPermissionRecharge: data.value,
      })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  detail () {
    let { id } = this.props.user
    this.setState({ loading: true })
    UserService.detail(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        user: data,
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  cashAccount() {
    let { id } = this.props.user
    this.setState({ loading: true })
    UserService.cashAccount({ userId: id }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        cashAccount: data,
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  toEdit () {
    let { user: { id }, history, location: { pathname } } = this.props
    history.push(`/${pathname}/edit/${id}`)
  }
  render() {
    let { history, location: { pathname } } = this.props
    let { user, cashAccount, isPermissionRecharge, loading } = this.state
    user = op({ ...user, cashAccount})
    let cashTypeIsWechat = user.get('cashAccount.type.value') === CASH_ACCOUNT.TYPE_IS_WECHAT

    return (<div className={styles.detail}>
      <Breadcrumb items={breadItems} location={this.props.location} />
      <Card className={styles.card} type="inner" title='基本信息'>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}><label>运营商名称:</label><span>{user.get('name') || '-'}</span></Col>
          <Col xs={{ span: 24 }} sm={{ span: 16 }}><label>登录账号:</label><span>{user.get('account') || '-'}</span>
            <a style={{ marginLeft: 15 }} onClick={() => { history.push(`/admin/settings/change-password`) }}>修改密码</a>
          </Col>
        </Row>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}><label>联系人:</label><span>{user.get('contact') || '-'}</span></Col>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}><label>手机号:</label><span>{user.get('mobile') || '-'}</span></Col>
        </Row>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}><label>服务电话:</label><span>{user.get('telephone') || '-'}</span></Col>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}><label>地址:</label><span>{user.get('address') || '-'}</span></Col>
        </Row>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 20 }}>
            <Button
              type='primary'
              style={{ marginRight: 10, marginTop: 10 }}
              onClick={() => { this.props.history.push(`${pathname}/edit/${user.get('id')}`) }}>
              修改信息
            </Button>
            {isPermissionRecharge ? <Button
              type='primary'
              style={{ backgroundColor: "#ED9D51", borderColor: "#ED9D51" }}
              onClick={() => { this.props.history.push('/soda/business/recharges-chipcard') }}>
              IC卡金额转移
            </Button> : null }
          </Col>
        </Row>
      </Card>
      <Card className={styles.card} title='收款信息' type="inner">
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 24 }}><label>是自动结算:</label><span>{user.get('cashAccount.mode.value') === 0 ? '是' : '否'}</span></Col>
          <Col xs={{ span: 24 }} sm={{ span: 24 }}><label>收款方式:</label><span>{CASH_ACCOUNT.TYPE[user.get('cashAccount.type.value')] || '-'}</span></Col>
          { 
            cashTypeIsWechat ?  
            <Col xs={{ span: 24 }} sm={{ span: 24 }}><label>姓名 | 昵称:</label><span>{_.without([user.get('cashAccount.realName'), user.get('nickName')], '').join(' | ') || '-'}</span></Col>  :
            <Col xs={{ span: 24 }} sm={{ span: 24 }}><label>姓名 | 账号:</label><span>{_.without([user.get('cashAccount.realName'), user.get('cashAccount.account')], '').join(' | ') || '-'}</span></Col>
          }
        </Row>
         <Row>
          <Col xs={{ span: 24 }} sm={{ span: 20 }}>
            <Button
              type='primary'
              style={{ marginRight: 10, marginTop: 10 }}
              onClick={() => { this.props.history.push(`${pathname}/edit/${user.get('id')}?type=cash`) }}>
              修改收款信息
            </Button>
          </Col>
        </Row>
      </Card>

    </div>)
  }
}

function mapStateToProps(state,props) {
  return {
    user: state.common.userInfo.user,
    ...props
  }
}
export default connect(mapStateToProps)(App)
