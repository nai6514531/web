import React from 'react'
import ReactDOM from 'react-dom'
import { withRouter } from "react-router-dom"
import { Layout } from 'antd'
import { connect } from 'dva'
import Nav from './nav/'
import SideBar from './sidebar/'
import { storage } from '../../utils/storage.js'
import classNames from 'classnames'
import './index.css'

const { Sider } = Layout

class Wrapper extends React.Component {
  componentDidMount() {
    if(!storage.val('token')) {
      this.props.history.push('/')
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

  render() {
    const { common: { fold, navOpenKeys }, dispatch } = this.props
    const wrapper = classNames('wrapper',{
      'wrapper-fold': !fold,
      'wrapper-unfold': fold
    })
    const logo = classNames({
      'logo': !fold,
      'fold-logo': fold
    })
    const mode = fold ? 'vertical' : 'inline'
    const imageUrl = fold ? require('../../assets/favicon.png') : require('../../assets/logo.png')
    return (
      <Layout>
        <Sider
          className='side'
          collapsible
          collapsed={fold}
          trigger={null}
          >
          <img src={imageUrl} className={logo}/>
          <SideBar
            {...this.props}
            mode={mode}
            navOpenKeys={navOpenKeys}
            changeOpenKeys={this.changeOpenKeys}/>
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
