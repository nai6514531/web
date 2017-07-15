import React from 'react'
import ReactDOM from 'react-dom'
import iScroll from 'iscroll'
import { Layout } from 'antd'
import { connect } from 'dva'
import Nav from './nav/'
import SideBar from './sidebar/'
import classNames from 'classNames'
import './index.css'
import ReactIScroll from 'react-iscroll'

const { Sider } = Layout
const option = {
  mouseWheel: true,
  scrollbars: true,
  scrollY: true,
  scrollX: true
}
class Wrapper extends React.Component {
  render() {

    const { ui: { fold } } = this.props
    const wrapper = classNames('wrapper',{
      'wrapper-fold': !fold,
      'wrapper-unfold': fold
    })
    return (
      <Layout>
        <Sider
          className='side'
          collapsible
          collapsed={fold}
          trigger={null}
          >
          <img src={require('../../assets/logo.png')} className='logo'/>
          <SideBar {...this.props}/>
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
