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
    title: '运营商管理',
    url: '/soda/business/account'
  },
  {
    title: '修改运营商'
  }
]

const subEditBreadItems = [
  {
    title: '苏打生活',
  },
  {
    title: '运营商管理',
    url: '/soda/business/account'
  },
  {
    title: '下级运营商',
    url: `/soda/business/account/sub?parentId=PARENT_ID`
  },
  {
    title: '修改运营商'
  }
]

const subAddBreadItems = [
  {
    title: '苏打生活',
  },
  {
    title: '运营商管理',
    url: '/soda/business/account'
  },
  {
    title: '下级运营商',
    url: `/soda/business/account/sub?parentId=PARENT_ID`
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
    let { isSub, isAdd, redirectUrl, parentId } = this.props
    let items = isSub ? (isAdd ? subAddBreadItems : subEditBreadItems) :
    !!redirectUrl ? settlementBreadItems : breadItems

    items = _.map(items, (item) => {
      if (item.url) {
        let url = item.url.replace('PARENT_ID', parentId)
        return { title: item.title, url: url }
      }
      return item
    })

    return <Breadcrumb items={items} />
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      activeKey: 'default',
      parentId: '',
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
    let { parentId, type, redirectUrl } = querystring.parse(query)
    this.account.isAdd = !!~this.props.location.pathname.indexOf('add')
    this.account.isSub = !!parentId
    this.setState({ parentId: parentId || '' , activeKey: type || 'default', redirectUrl })
    if (this.account.isAdd) {
      return
    }
    this.detail()
  }
  detail() {
    let { id } = this.props.match.params
    this.setState({ loading: true })
    UserService.GetDetailWithCashAccount({ id: id }).then((res) => {
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
  changeTab(key) {
    let self = this
    confirm({
      title: '确定取消当前修改?',
      onOk() {
        self.setState({ activeKey: key　})
      },
      onCancel() {
      },
    })
  }
  render() {
    let { isAdd, isSub } = this.account
    let { detail, activeKey, redirectUrl, loading, parentId } = this.state

    return <div>
      <Bread isAdd={isAdd} isSub={isSub} redirectUrl={redirectUrl} parentId={parentId} />
      <Tabs
        activeKey={activeKey}
        onChange={this.changeTab.bind(this)}>
        <TabPane tab="基本信息" key="default">
          { activeKey === 'default' ? <Detail {...this.props} loading={loading} detail={detail} isAdd={isAdd} isSub={isSub} parentId={parentId} redirectUrl={redirectUrl} /> : null }
        </TabPane>
        <TabPane tab="收款信息" key="cash" disabled={isAdd ? true : false} >
          { activeKey === 'cash' ? <Pay {...this.props}
          loading={loading} detail={detail} isAdd={isAdd} isSub={isSub} redirectUrl={redirectUrl} parentId={parentId} /> : null }
        </TabPane>
      </Tabs>
    </div>
  }
}

export default App

