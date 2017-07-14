import React from 'react'
import ReactDOM from 'react-dom'
import iScroll from 'iscroll'
import { Layout } from 'antd'
import { connect } from 'dva'
import Nav from './nav/'
import SideBar from './sidebar/'
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
    console.log("fold",fold)
    return (
      <div>
        <Nav/>
        <Sider
          className='side'
          collapsible
          collapsed={fold}
          trigger={null}
          >
          <img src={require('../../assets/logo.png')} className='logo'/>
          <SideBar />
        </Sider>
        <div className='wrapper'>
          <ReactIScroll
            iScroll={iScroll}
            options={option}>
              <div className='main'>
               {this.props.children}
              </div>
          </ReactIScroll>
        </div>
      </div>
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
