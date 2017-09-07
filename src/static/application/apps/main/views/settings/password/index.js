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
  },
}

class ResetPassword extends Component {
  constructor(props) {
    super(props)
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { history } = this.props
        values.oldPassword = md5(values.oldPassword)
        values.newPassword = md5(values.newPassword)
        delete values.rePassword
        this.props.dispatch({
          type: 'user/reset',
          payload: {
            data: values,
            history
          }
        })
      }
    })
  }
  handleConfirmBlur = (e) => {
    const value = e.target.value
    this.props.dispatch({
      type: 'user/updateConfirmDirty',
      payload: {
        confirmDirty: !!value
      }
    })
    this.setState({ confirmDirty: !!value })
  }
  checkPassword = (rule, value, callback) => {
     const form = this.props.form
     if (value && value !== form.getFieldValue('newPassword')) {
       callback('两次密码输入不一致')
     } else {
       callback()
     }
   }
  checkConfirm = (rule, value, callback) => {
    const form = this.props.form
    if (value && this.props.user.confirmDirty) {
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
                validator: this.checkConfirm,
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
                validator: this.checkPassword,
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
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(ResetPassword))
