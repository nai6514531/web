import React, { Component } from 'react'
import { render } from 'react-dom'
import { Layout, Icon, Row, Col, Popover, Modal } from 'antd'
import { connect } from 'dva'
import { storage, session } from '../../../utils/storage.js'
import SideBar from  '../sidebar/'
import classNames from 'classnames'
import styles from './index.pcss'

const { Header } = Layout
const confirm = Modal.confirm

class Nav extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const defaultFold = session.val('fold') || false
    this.props.dispatch({
      type: 'common/foldMenu',
      payload: { fold: defaultFold }
    })
  }

  handleVisibleChange = (menuPopoverVisible) => {
    this.props.dispatch({
      type: 'common/popMenu',
      payload: { menuPopoverVisible }
    })
  }

  changeOpenKeys = (openKeys) => {
    this.props.dispatch({
     type: 'common/handleNavOpenKeys',
     payload: { navOpenKeys: openKeys }
    })
  }

  foldMenu = () => {
    const { dispatch, common: {  fold } } = this.props
    dispatch({
      type: 'common/foldMenu',
      payload: { fold: !fold }
    })
    session.val('fold',!fold)
  }

  showModal = () => {
    const { dispatch, history } = this.props
    confirm({
      title: '确认退出吗',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'common/logout',
          payload: { history: history }
        })
      }
    })
  }

  render() {
    const { dispatch, common: { menuPopoverVisible, fold, navOpenKeys, userInfo } } = this.props
    const header = classNames(styles.header,styles.wrapper,{
      [styles['header-unfold']]: !fold,
      [styles['header-fold']] : fold
    })
    const iconBars = classNames(styles.icon,styles.bars)
    const iconFold = classNames(styles.icon,styles.fold)
    return (
      <Header className={header}>
        <Popover
          placement='bottomRight'
          content={
            <SideBar
              {...this.props}
              theme='light'
              mode='inline'
              fold={false}
              navOpenKeys={navOpenKeys}
              handleClick={this.handleVisibleChange.bind(this,false)}
              changeOpenKeys={this.changeOpenKeys}
          />}
          trigger='click'
          overlayClassName={styles.popovermenu}
          visible={menuPopoverVisible}
          onVisibleChange={this.handleVisibleChange}
          >
          <div className={iconBars}>
            <Icon type='bars'/>
          </div>
        </Popover>
        <div
          className={iconFold}
          onClick={this.foldMenu}>
          { !fold ? <Icon type='menu-fold'/> : <Icon type='menu-unfold'/> }
        </div>
        <div className={styles.logout}>
          <span>{userInfo.user.name},您好！</span>
          <div
            className={styles.icon}
            onClick={this.showModal}>
            <Icon type='logout'/>
          </div>
        </div>
      </Header>
    )
  }
}

function mapStateToProps(state,props) {
  return {
    common: state.common,
    ...props
  }
}

export default connect(mapStateToProps)(Nav)
