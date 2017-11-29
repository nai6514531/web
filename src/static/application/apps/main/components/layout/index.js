import React from 'react'
import ReactDOM from 'react-dom'
import { withRouter } from 'react-router-dom'
import { Layout } from 'antd'
import { connect } from 'dva'
import Nav from './nav/'
import SideBar from './sidebar/'
import { storage } from '../../utils/storage.js'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import './index.css'

const { Sider } = Layout

class Wrapper extends React.Component {
  componentDidMount() {
    if(!storage.val('token')) {
      this.props.history.push('/')
    } else {
      // 获取用户信息
      this.props.dispatch({ type: 'common/info' })
    }
  }

  changeOpenKeys = (openKeys) => {
    this.props.dispatch({
      type: 'common/handleNavOpenKeys',
      payload: {
        navOpenKeys: openKeys
      }
    })
  }
  changeSelectedKeys = (selectedKeys) => {
    this.props.dispatch({
      type: 'common/handleSelectedKeys',
      payload: {
        selectedKeys: selectedKeys
      }
    })
  }
  clickHandler = () => {
    this.changeOpenKeys([])
    this.changeSelectedKeys([])
  }
  render() {
    const { common: { fold, navOpenKeys, userInfo, selectedKeys }, dispatch } = this.props
    const mode = fold ? 'vertical' : 'inline'
    const imageUrl = fold ? require('../../assets/favicon.png') : require('../../assets/logo.png')
    const wrapper = classNames('wrapper',{
      'wrapper-fold': !fold,
      'wrapper-unfold': fold
    })
    const sideWrap = classNames({
      'side': true,
      'unfold-side': !fold
    })
    const logo = classNames({
      'logo': !fold,
      'fold-logo': fold
    })
    const logoWrap = classNames({
      'fold-logo-wrap': fold,
      'logo-wrap': !fold
    })
    if(!userInfo.user) {
      return null
    }
    return (
      <Layout style={{ overflow: 'hidden' }}>
        <Sider
          className={sideWrap}
          collapsible
          collapsed={fold}
          trigger={null}
          >
          <div className={logoWrap}><Link to='/admin' onClick={this.clickHandler}><img src={imageUrl} className={logo}/></Link></div>
          <SideBar
            {...this.props}
            mode={mode}
            fold={fold}
            navOpenKeys={navOpenKeys}
            selectedKeys={selectedKeys}
            changeOpenKeys={this.changeOpenKeys}
            changeSelectedKeys={this.changeSelectedKeys}/>
        </Sider>
        <Layout>
          <Nav {...this.props}/>
          <div className={wrapper}>
            {this.props.children}
          </div>
        </Layout>
      </Layout>
    )
  }
}

function mapStateToProps(state,props) {
  return {
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(withRouter(Wrapper))
