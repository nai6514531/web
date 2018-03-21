import React, { Component }from 'react'
import querystring from 'querystring'
import { Tabs, Modal, message } from 'antd'
const TabPane = Tabs.TabPane
const confirm = Modal.confirm

import UserService from '../../../../../services/soda-manager/user'

import Breadcrumb from '../../../../../components/layout/breadcrumb'
import Detail from './detail'
import Pay from './pay'
import CASH_ACCOUNT from '../../../../../constant/cash-account'

import styles from '../index.pcss'

const id = querystring.parse(window.location.search.slice(1)).parentId

const breadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '账号管理',
  },
  {
    title: '个人信息',
    url: '/soda/business/account'
  },
  {
    title: '修改'
  }
]

const subEditBreadItems = [
  {
    title: '苏打生活',
  },
  {
    title: '账号管理',
  },
  {
    title: '下级运营商',
    url: `/soda/business/account/sub`
  },
  {
    title: '修改'
  }
]

const subAddBreadItems = [
  {
    title: '苏打生活',
  },
  {
    title: '账号管理',
  },
  {
    title: '下级运营商',
    url: `/soda/business/account/sub`
  },
  {
    title: '新增运营商'
  }
]

const settlementBreadItems = [
  {
    title: '苏打生活',
  },
  {
    title: '结算查询',
    url: '/soda/business/bill'
  },
  {
    title: '修改',
  }
]

class Bread extends Component {
  constructor(props) {
    super(props)
  }
  render () {
    let { isSub, isAdd, redirectUrl } = this.props
    let items = isAdd ? subAddBreadItems : 
    isSub ? subEditBreadItems : 
    !!redirectUrl ? settlementBreadItems : breadItems

    return <Breadcrumb items={items} />
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      activeKey: 'default',
      detail: {
        name: '',
        contact: '',
        mobile: '',
        telephone: '',
        address: '',
        accountName: '',
        cashAccount: {
          type: CASH_ACCOUNT.TYPE_IS_WECHAT,
          account: '',
          realName: '',
          isAuto: true
        }
      },
      redirectUrl: ''
    }
    this.account = {
      isAdd: false,
      isSub: false
    }
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    let { isSub, type, redirectUrl } = querystring.parse(query)
    this.account.isAdd = !!~this.props.location.pathname.indexOf('add')
    this.account.isSub = isSub === 'true' ? true : false
    this.setState({ activeKey: type || 'default', redirectUrl })
    if (this.account.isAdd) {
      return
    }
    this.detail()
    this.cashAccount()
  }
  detail() {
    let { id } = this.props.match.params
    this.setState({ loading: true })
    UserService.detail(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        detail: data,
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  cashAccount() {
    let { id } = this.props.match.params
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
  changeTab(key) {
    this.setState({ activeKey: key　})
  }
  render() {
    let { isAdd, isSub } = this.account
    let { detail, cashAccount, activeKey, redirectUrl, loading } = this.state
    detail = { ...detail, cashAccount }
    return <div>
      <Bread isAdd={isAdd} isSub={isSub} redirectUrl={redirectUrl} />
      <Tabs
        activeKey={activeKey}
        onChange={this.changeTab.bind(this)}>
        <TabPane tab="基本信息" key="default">
          { activeKey === 'default' ? <Detail {...this.props} loading={loading} detail={detail} isAdd={isAdd} isSub={isSub} redirectUrl={redirectUrl} /> : null }
        </TabPane>
        <TabPane tab="收款信息" key="cash" disabled={isAdd ? true : false} >
          { activeKey === 'cash' ? <Pay {...this.props}
          loading={loading} detail={detail} isAdd={isAdd} isSub={isSub} redirectUrl={redirectUrl} /> : null }
        </TabPane>
      </Tabs>
    </div>
  }
}

export default App

