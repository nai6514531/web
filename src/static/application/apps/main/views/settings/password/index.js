import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import { Form, Input, Button } from 'antd'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import md5 from 'md5'

const FormItem = Form.Item
const breadItems = [
  {
    title: '设置'
  },
  {
    title: '修改密码'
  }
]
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

class ResetPassword extends Component {
  constructor(props) {
    super(props)
    this.state = {
      confirmDirty: false,
    }
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        this.props.dispatch({
          type: 'user/updatePassword',
          payload: {
            data: {
              oldPassword: md5(values.oldPassword),
              newPassword: md5(values.newPassword),
              id: this.props.common.userInfo.user.id
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

  render() {
    const { form: { getFieldDecorator }, loading } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem
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
          </FormItem>
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
                validator: this.validateToNextPassword,
              }]
            })(
              <Input type='password'/>
            )}
          </FormItem>
          <FormItem
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
          </FormItem>
          <FormItem style={{textAlign: 'center'}}>
            <Button
              type='primary'
              loading={loading}
              onClick={this.handleSubmit}>
              保存
            </Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}
function mapStateToProps(state,props) {
  return {
    loading: state.loading.global,
    user: state.user,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(ResetPassword))
