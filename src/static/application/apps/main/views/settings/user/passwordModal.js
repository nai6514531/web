import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Radio, Popover, Button } from 'antd'
import { transformUrl, toQueryString } from '../../../utils/'
import { difference } from 'lodash'
import md5 from 'md5'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  }
}
class PasswordModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmDirty: false,
    }
  }
  hide = () => {
    this.props.dispatch({
      type: 'user/hideModal'
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
         this.props.dispatch({
          type: 'user/updatePassword',
          payload: {
            data: {
              newPassword: md5(values.newPassword),
              id: this.props.id
            }
          }
        })
      }
    })
  }
  handleConfirmBlur = (e) => {
    const value = e.target.value
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue('newPassword')) {
      callback('两次密码输入不一致')
    } else {
      callback()
    }
  }
  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && this.state.confirmDirty) {
      form.validateFields(['rePassword'], { force: true })
    }
    callback()
  }
  reset = () => {
    const { resetFields, getFieldsValue } = this.props.form
    resetFields(Object.keys(getFieldsValue()))
  }
  render() {
    const { form: { getFieldDecorator }, user: { key, visible }, loading  } = this.props
    return(
      <Modal
        title='修改密码'
        visible={visible}
        onCancel={this.hide}
        onOk={this.handleSubmit}
        afterClose={this.reset}
      >
      <Form onSubmit={this.handleSubmit}>
          {/* <FormItem
            {...formItemLayout}
            label='原始密码'
          >
            {getFieldDecorator('oldPassword', {
              rules: [{
                required: true, message: '请输入原始密码',
              }, {
                min: 6, message: '密码最少6位'
              }]
            })(
              <Input type='password'/>
            )}
          </FormItem> */}
          <FormItem
            {...formItemLayout}
            label='新密码'
          >
            {getFieldDecorator('newPassword', {
              rules: [{
                required: true, message: '请输入新密码',
              }, {
                min: 6, message: '密码最少6位'
              }, {
                // validator: this.validateToNextPassword,
              }]
            })(
              <Input type='password'/>
            )}
          </FormItem>
          {/* <FormItem
            {...formItemLayout}
            label='确认密码'
          >
            {getFieldDecorator('rePassword', {
              rules: [{
                required: true, message: '请输入确认密码',
              }, {
                min: 6, message: '密码最少6位'
              }, {
                validator: this.compareToFirstPassword,
              }]
            })(
              <Input type='password' onBlur={this.handleConfirmBlur}/>
            )}
          </FormItem> */}
        </Form>
      </Modal>
    )
  }
}
PasswordModal = Form.create()(PasswordModal)
export default PasswordModal
