import React, { Component } from 'react'
import { render } from 'react-dom'
import { Layout, Icon, Row, Col, Popover } from 'antd'
import { connect } from 'dva'
import SideBar from  '../sidebar/'
import styles from './index.pcss'
const { Header } = Layout
class Nav extends React.Component {
  hide = () => {
    this.props.dispatch({ type: 'ui/popMenu', payload: { visible: false } })
  }
  handleVisibleChange = (visible) => {
    this.props.dispatch({ type: 'ui/popMenu', payload: { visible } })
  }
  render() {
    const { dispatch, ui: { visible, fold } } = this.props
    return (
      <Header className={styles.header + ' ' + styles.wrapper}>
        <Popover
          placement='bottomRight'
          content={<SideBar {...this.props} theme='light'/>}
          trigger='click'
          overlayClassName={styles.popovermenu}
          visible={visible}
          onVisibleChange={this.handleVisibleChange}
          >
          <div className={styles.icon + ' ' + styles.bars}>
            <Icon type='bars'/>
          </div>
        </Popover>
        <div
          className={styles.icon + ' ' + styles.fold}
          onClick={() => dispatch({ type: 'ui/foldMenu', payload: { fold: !fold } })}>
          { !fold ? <Icon type='menu-fold'/> : <Icon type='menu-unfold'/> }
        </div>
        <div className={styles.logout}>
          <span>xxx,您好！</span>
          <div className={styles.icon}>
            <Icon type='logout'/>
          </div>
        </div>
      </Header>
    )
  }
}
function mapStateToProps(state,props) {
  return {
    ui: state.ui,
    ...props
  }
}

export default connect(mapStateToProps)(Nav)
