import React, { Component } from 'react'
import { render } from 'react-dom'
import { Modal, Button } from 'antd'
const confirm = Modal.confirm

class NotFound extends Component {
  componentDidMount() {
    this.showConfirm()
  }
  showConfirm = () => {
    const { history } = this.props
    confirm({
      title: '404',
      content: '您访问的页面不存在',
      onOk() {
        history.goBack()
      },
      onCancel() {
        history.goBack()
      },
    })
  }
  render() {
    return(
      <span />
    )
  }
}
export default NotFound
