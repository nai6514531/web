import React from 'react'
import ReactDOM from 'react-dom'
import { Layout } from 'antd'
import { connect } from 'dva'
import Nav from './nav/'
import SideBar from './sidebar/'
import classNames from 'classnames'
import './index.css'
const { Sider } = Layout

class Wrapper extends React.Component {
  render() {
    const { ui: { fold } } = this.props
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
          <SideBar {...this.props} mode={mode}/>
        </Sider>
        <Layout>
          <Nav />
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
    ui: state.ui,
    ...props
  }
}
export default connect(mapStateToProps)(Wrapper)
