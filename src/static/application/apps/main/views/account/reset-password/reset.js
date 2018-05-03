import React, { Component } from 'react'
import { connect } from 'dva'
import { Button, Row, Col, Form, Input } from 'antd'
import md5 from 'md5'

import Throttle from '../../../components/throttle'
import { MOTIVATION } from '../../../constant/sms'

import styles from './index.pcss'

const { Item: FormItem } = Form
const VERIFY_ACCOUNT = '验证身份'

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 6,
    },
  },
}
class Reset extends Component {
  constructor(props) {
    super(props)
  }
  reset() {
    let { form:{ validateFieldsAndScroll }, loading, token, dispatch } = this.props
    validateFieldsAndScroll((errors, values) => {
      if (errors || loading) {
        return
      }
      dispatch({
        type: 'resetPassword/reset',
        payload: {
          data: {
            password: md5(values.password),
            token: token
          }
        }
      })
    })
  }
  prev() {
    this.props.dispatch({ 
      type: 'resetPassword/prev',
      payload: {
        data: {
          current: VERIFY_ACCOUNT
        }
      }
    })
  }
  render() {
    let { form: { getFieldDecorator, validateFields, getFieldValue } } = this.props
    return (<form className={styles.content}>
      <FormItem
        {...formItemLayout}
        label='新密码'>
        {getFieldDecorator('password', {
          initialValue: '',
          rules: [
            {
              required: true, 
              message: '密码不可为空',
            },
            {
              type: 'string',
              min: 6,
              max: 16,
              message: '请输入6-16位新密码',
            },
            {
              validator: (rule, value, callback) => {
                if (value && getFieldValue('confirm')) {
                  validateFields(['confirm'], { force: true })
                }
                callback()
              },
            },
          ],
        })(
          <Input type='password' placeholder='请输入新密码' />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label='确认新密码'>
        {getFieldDecorator('confirm', {
          initialValue: '',
          rules: [
            {
              required: true, message: '密码不可为空',
            },
            {
              validator: (rule, value, callback) => {
                if (value && value !== getFieldValue('password')) {
                  return callback(new Error('请检查两次输入的密码是否一致'))
                }
                callback()
              },
            }
          ],
        })(
          <Input type='password' placeholder='请再次输入新密码' />
        )}
      </FormItem>
      <FormItem {...tailFormItemLayout}>
        <Button style={{ marginRight: 10 }} onClick={this.prev.bind(this)}>返回上一步</Button>
        <Button style={{ marginRight: 10 }} type='primary' onClick={this.reset.bind(this)}>确认修改</Button>
      </FormItem>
    </form>)
  }
}

function mapStateToProps(state, props) {
  return {
    ...state.resetPassword,
    ...props,
  }
}
export default connect(mapStateToProps)(Form.create()(Reset))