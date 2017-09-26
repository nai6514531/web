import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Link } from 'react-router-dom'
import { Button, Row, Col, Form, Input, Checkbox } from 'antd'
import { storage } from '../../utils/storage.js'
import md5 from 'md5'
import styles from './index.pcss'

const FormItem = Form.Item

class Login extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    if(storage.val('token')) {
      this.props.history.push('/admin')
    }
    this.changeCaptcha()
  }

  handleOk = () => {
    const { form:{ validateFieldsAndScroll }, dipatch, history } = this.props
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      values.initPassword = values.password
      values.password = md5(values.password)
      this.props.dispatch({
        type: 'login/login',
        payload: { data: values, history }
      })
    })
  }

  changeCaptcha = () => {
    const { dispatch } = this.props
    dispatch({type: 'login/captcha'})
  }

  render() {
    const { loading, dipatch, form: { getFieldDecorator }, login: { captcha, accountHelp, passwordHelp, captchaHelp } } = this.props
    const loginInfo = storage.val('login') === null ? {} : storage.val('login')
    return (
      <div className={styles.wrapper}>
        <div className={styles.form}>
          <div className={styles.logo}>
            <img alt={'图片加载失败'} src={require('../../assets/favicon.png')} />
            <span>苏打管理系统</span>
          </div>
          <form>
            <FormItem
              {...accountHelp}>
              {getFieldDecorator('account', {
                initialValue: loginInfo.account,
                rules: [
                  {
                    required: true, message: '请输入注册时填写的登录账号',
                  },
                ],
              })(
                <Input
                  size='large'
                  placeholder='请输入登录账号'
                  onPressEnter={this.handleOk}
                />
              )}
            </FormItem>
            <FormItem
              {...passwordHelp}>
              {getFieldDecorator('password', {
                initialValue: loginInfo.initPassword,
                rules: [
                  {
                    required: true, message: '请输入密码',
                  }
                ],
              })(
                <Input
                  size='large'
                  type='password'
                  placeholder='请输入密码'
                  onPressEnter={this.handleOk}
                />
              )}
            </FormItem>
            <FormItem
              {...captchaHelp}>
              {getFieldDecorator('captcha', {
                rules: [
                  {
                    required: true, message: '请输入图形验证码',
                  },
                ],
              })(
              <Row>
                <Col span={17}>
                  <Input
                    size='large'
                    placeholder='请输入图形验证码'
                    onPressEnter={this.handleOk}/>
                </Col>
                <Col span={7}>
                  <img
                    className={styles.captcha}
                    src={captcha}
                    onClick={this.changeCaptcha}
                    />
                </Col>
              </Row>
              )}
              {/* <a href="#" onClick={this.changeCaptcha}>看不清楚?换一张</a>*/}
            </FormItem>
            <Row className={styles.button}>
              <Button type='primary' size='large' onClick={this.handleOk} loading={loading}>
                登录
              </Button>
            </Row>
            <FormItem>
              <Col span={18}>
                {getFieldDecorator('checked', {
                   valuePropName: 'checked',
                   initialValue: !(storage.val('login') === null),
                 })(
                   <Checkbox>记住密码</Checkbox>
                 )}
              </Col>
            </FormItem>
          </form>
        </div>
        <div className={styles.text}>
          <p>Copyright © 2017 苏打生活. All Rights Reserved</p>
          <p>客服电话:400-8678-884 粤ICP备<a href='http://www.miitbeian.gov.cn/state/outPortal/loginPortal.action;jsessionid=nU8rLzUPO4kyMeVHmviUQBcwFVqPJxbScSgxQYI55eT5XpjyRUHw!1069245859'>16090794号</a></p>
          <p>深圳市华策网络科技有限公司</p>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state,props) {
  return {
    login: state.login,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Login))
