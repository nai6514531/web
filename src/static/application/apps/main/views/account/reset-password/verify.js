import React, { Component } from 'react'
import { connect } from 'dva'
import { Button, Row, Col, Form, Input, Modal } from 'antd'

import Throttle from '../../../components/throttle'
import { MOTIVATION } from '../../../constant/sms'

import styles from './index.pcss'

const { Item: FormItem } = Form

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
class Verify extends Component {
  constructor(props) {
    super(props)
  }
  componentWillMount() {
    this.updateCaptcha()
  }
  componentWillReceiveProps(nextProps) {
    let { mobile, isShowTip } = nextProps
    let { dispatch } = this.props
    console.log(mobile)
    if (!!mobile && isShowTip) {
      Modal.info({
        content: (
          <div>
            <p>正在给手机号：{mobile} 发送短信验证码，如手机号有误或收取不到验证码请联系苏打生活客服。</p>
          </div>
        ),
        okText: '我知道了',
        onOk: () => {
          dispatch({
            type: 'resetPassword/hideTip',
          })
        },
      });
    }
  }
  verifyAccount() {
    let { form:{ validateFieldsAndScroll }, loading, captcha, dispatch } = this.props
    validateFieldsAndScroll((errors, values) => {
      if (errors || loading) {
        return
      }
      dispatch({
        type: 'resetPassword/verifyAccount',
        payload: {
          data: {
            account: values.account,
            smsCode: values.smsCode
          }
        }
      })
    })
  }
  updateCaptcha() {
    this.props.dispatch({ type: 'resetPassword/captcha' })
  }
  handleClickCounter() {
    let { form:{ getFieldValue, validateFields }, loading, captcha, dispatch } = this.props

    validateFields(['account', 'code'], (errors, values) => {
      if (errors || loading) {
        return
      }
      dispatch({ 
        type: 'resetPassword/smsCode',
        payload: {
          data: {
            motivation: MOTIVATION.RESET_PASSWORD,
            account: getFieldValue('account'),
            captcha: {
              code: values.code,
              key: captcha && captcha.split("//")[1].match(/\/(.*)/)[0],
            },
          }
        }
      })
    })
    
  }
  changeErrors(field) {
    this.props.dispatch({ 
      type: 'resetPassword/changeErrors',
      payload: {
        data: {
          field: field,
        }
      }
    })
  }
  render() {
    let { form: { getFieldDecorator }, startedAt, captcha, account, errors } = this.props

    return (<form className={styles.content}>
      <FormItem
        {...formItemLayout}
        {...errors.account}
        label='登录账号'>
        {getFieldDecorator('account', {
          initialValue: account,
          rules: [
            {
              required: true, 
              message: '登录账号不可为空',
            },
          ],
        })(
          <Input placeholder='请输入登录账号' onChange={this.changeErrors.bind(this, 'account')} />
        )}
      </FormItem>
       <FormItem
        {...formItemLayout}
        {...errors.code}
        label='图形验证码'> 
        <Row gutter={8}>
          <Col span={12}>
            {getFieldDecorator('code', {
              rules: [
                { 
                  required: true,
                  message: '请输入图形验证码',
                },
              ],
              initialValue: '',
            })(
              <Input placeholder='请输入图形验证码' onChange={this.changeErrors.bind(this, 'code')} />
            )}
          </Col>
          <Col span={12}>
            <img
              className={styles.captcha}
              src={captcha}
              onClick={this.updateCaptcha.bind(this)} />
          </Col>
        </Row>
      </FormItem>
      <FormItem
        {...formItemLayout}
        {...errors.smsCode}
        label='短信验证码'> 
        <Row gutter={8}>
          <Col span={12}>
            {getFieldDecorator('smsCode', {
              rules: [
                { 
                  required: true, 
                  message: '必填',
                },
              ],
              initialValue: '',
            })(
              <Input placeholder='请输入短信验证码' onChange={this.changeErrors.bind(this, 'smsCode')} />
            )}
          </Col>
          <Col span={12}>
            <Throttle
              startedAt={startedAt}
              waitText={({ countdown }) => `重获验证码 (${countdown})`}
              className={styles.send}
              onClick={this.handleClickCounter.bind(this)}>
              <Button>发送验证码</Button>
            </Throttle>
          </Col>
        </Row>
      </FormItem>
      <FormItem {...tailFormItemLayout}>
        <Button style={{ marginRight: 10 }} type='primary' onClick={this.verifyAccount.bind(this)}>下一步</Button>
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
export default connect(mapStateToProps)(Form.create()(Verify))