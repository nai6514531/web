import React, { Component } from 'react'
import { connect } from 'dva'
import { Steps, Icon } from 'antd'
import cx from 'classnames'

import Reset from './reset'
import Verify from './verify'
import styles from './index.pcss'

const { Step } = Steps
const VERIFY_ACCOUNT = '验证身份'
const RESET_PASSWORD = '重置密码'
const DONE = '完成'
const steps = [VERIFY_ACCOUNT, RESET_PASSWORD, DONE]

class Done extends Component {
  render() {
    return(<div className={cx(styles.content, styles.done)}>
      <h2>新密码设置成功！</h2>
      <p>请牢记您的新密码 <a href='/'>返回登录</a></p>
    </div>)
  }
}

class App extends Component {
  componentWillUnmount() {
    this.props.dispatch({ type: 'resetPassword/clear'})
  }
  render() {
    let { current } = this.props
    return (<div className={styles.view}>
      <Steps current={steps.indexOf(current)}>
        { 
          steps.map(title => <Step key={title} title={title}></Step>)
        }
      </Steps>
      {
        current === VERIFY_ACCOUNT ? <Verify /> :
        current === RESET_PASSWORD ? <Reset />  : <Done />
      }
    </div>)
  }
}
function mapStateToProps(state, props) {
  return {
    ...state.resetPassword,
    ...props,
  }
}
export default connect(mapStateToProps)(App)