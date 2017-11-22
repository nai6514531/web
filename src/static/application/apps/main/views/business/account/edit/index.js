import React, { Component }from 'react'
import querystring from 'querystring'
import { Tabs } from 'antd'
const TabPane = Tabs.TabPane

import UserService from '../../../../services/soda-manager/user'

import Breadcrumb from '../../../../components/layout/breadcrumb'
import Detail from './detail'
import Pay from './pay'
import CONSTANT from '../../constant'

import styles from '../index.pcss'

const id = querystring.parse(window.location.search.slice(1)).parentId

const breadItems = [
  {
    title: '商家系统'
  },
  {
    title: '运营商',
    url: '/business/account'
  },
  {
    title: '修改运营商'
  }
]

const subEditBreadItems = [
  {
    title: '商家系统',
  },
  {
    title: '运营商',
    url: '/business/account'
  },
  {
    title: '下级运营商',
    url: `/business/account?parentId=${id}`
  },
  {
    title: '修改运营商'
  }
]
const subAddBreadItems = [
  {
    title: '商家系统',
  },
  {
    title: '运营商',
    url: '/business/account'
  },
  {
    title: '下级运营商',
    url: `/business/account?parentId=${id}`
  },
  {
    title: '新增运营商'
  }
]

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
          type: CONSTANT.PAY_ACCOUNT_TYPE_IS_WECHAT,
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
    this.setState({ activeKey: key　})
  }
  render() {
    let { isAdd, isSub } = this.account
    let { detail, activeKey, redirectUrl, loading, parentId } = this.state

    return <div>
      <Breadcrumb items={isSub ? (isAdd ? subAddBreadItems : subEditBreadItems) : breadItems} />
      <Tabs 
        activeKey={activeKey}
        onChange={this.changeTab.bind(this)}>
        <TabPane tab="基本信息" key="default">
          { activeKey === 'default' ? <Detail {...this.props} loading={loading} detail={detail} isAdd={isAdd} isSub={isSub} parentId={parentId} /> : null }
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

