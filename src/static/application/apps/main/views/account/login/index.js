import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Button, Row, Col, Form, Input, Checkbox } from 'antd'
import { connect } from 'dva'
import md5 from 'md5'
import _ from 'lodash';

import { storage } from '../../../utils/storage.js'
import { isSodaLife,isSodaApp } from '../../../utils/debug.js'

import Throttle from '../../../components/throttle'
import { MOTIVATION } from '../../../constant/sms'

import styles from './index.pcss'

const FormItem = Form.Item;

const hostName = isSodaLife ? 'erp.sodalife.xyz' :'mng.sodaapp.cn';

const companyConfig={
  "erp.sodalife.xyz":{
    name:"苏打生活",
    company:"深圳市华策网络科技有限公司",
    beianPrefix:"粤ICP备",
    beianNumber:"16090794号"
  },
  "mng.sodaapp.cn":{
    name:"苏打校园",
    company:"海南娱玩科技有限公司",
    beianPrefix:"琼ICP备",
    beianNumber:"16000779号-2"
  }
};

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
    const { form:{ validateFieldsAndScroll, resetFields }, dipatch, history , login: { captcha, showSmsCode } } = this.props
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      this.props.dispatch({
        type: 'login/login',
        payload: {
          data: {
            showSmsCode: showSmsCode,
            account: values.account,
            password: md5(values.password),
            initPassword: values.password,
            smsCode: values.smsCode,
            checked: values.checked,
            captcha: {
              code: values.code,
              key: captcha && captcha.split("//")[1].match(/\/(.*)/)[0]
            }
          },
          history
        }
      })
    })
  }

  checkAccount = (e) => {
    const { dispatch } = this.props
    const { value } = e.target
    if (value.length <= 0) {
      return
    }
    dispatch({
      type: 'login/checkAccount',
      payload: {
        data: {
          account: value,
        }
      }
    })
  }

  changeCaptcha = () => {
    const { dispatch } = this.props
    dispatch({type: 'login/captcha'})
  }

  handleClickCounter = () => {
    const { form:{ validateFieldsAndScroll }, dispatch, login: { userId, smsLoading, captcha } } = this.props
    validateFieldsAndScroll(['account', 'code'], (errors, values) => {
      if (errors || smsLoading) {
        return
      }
      dispatch({
        type: 'login/smsCode',
        payload: {
          data: {
            motivation: MOTIVATION.LOGIN,
            account: values.account,
            captcha: {
              code: values.code,
              key: captcha && captcha.split("//")[1].match(/\/(.*)/)[0]
            }
          }
        }
      })
    })
  }

  render() {
    const {
      loading, dipatch, form: { getFieldDecorator },
      login: { captcha, accountHelp, passwordHelp, captchaHelp, smsCodeHelp, smsLoading, startedAt, showSmsCode }
    } = this.props
    const loginInfo = storage.val('login') === null ? {} : storage.val('login')

    return (
      <div className={styles.wrapper}>
        <div className={styles.form}>
          <div className={styles.logo}>
            <img alt={'图片加载失败'} src={require('../../../assets/favicon.png')} />
            <span>{companyConfig[hostName].name}管理系统</span>
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
                  onBlur={this.checkAccount}
                  onPressEnter={this.handleOk}
                />
              )}
            </FormItem>
            <FormItem
              {...captchaHelp}>
              <Row>
                <Col span={14}>
                  {getFieldDecorator('code', {
                    initialValue: '',
                    rules: [
                      {
                        required: true, message: '请输入图形验证码',
                      },
                    ],
                  })(
                  <Input
                    placeholder='请输入图形验证码'
                    onPressEnter={this.handleOk}/>)}
                </Col>
                <Col span={10}>
                  <img
                    className={styles.captcha}
                    src={captcha}
                    onClick={this.changeCaptcha}
                    />
                </Col>
              </Row>

              {/* <a href="#" onClick={this.changeCaptcha}>看不清楚?换一张</a>*/}
            </FormItem>
            {
              showSmsCode ?  <FormItem
                {...smsCodeHelp}
              >
                <Row>
                  <Col span={14}>
                    {getFieldDecorator('smsCode', {
                      rules: [
                        { required: true, message: '必填' },
                      ],
                      initialValue: '',
                    })(
                      <Input placeholder="请输入验证码" />
                    )}
                  </Col>
                  <Col span={10}>
                    <Throttle
                      startedAt={startedAt}
                      waitText={({ countdown }) => `重获验证码 (${countdown})`}
                      onClick={this.handleClickCounter}
                      disabled={smsLoading}>
                      <Button className={styles.smsCodeBtn}>发送验证码</Button>
                    </Throttle>
                  </Col>
                </Row>
              </FormItem> : null
            }
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
            <Row className={styles.button}>
              <Button type='primary' size='large' onClick={this.handleOk} loading={loading}>
                登录
              </Button>
              <a className={styles.reset} href="#" onClick={() => { this.props.history.push("/reset-password") }}>忘记密码?</a>
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
          <p>Copyright © 2018 {companyConfig[hostName].name}. All Rights Reserved</p>
          <p>客服电话:400-8678-884 {companyConfig[hostName].beianPrefix}<a href='http://www.miitbeian.gov.cn/'>{companyConfig[hostName].beianNumber}</a></p>
          <p>{companyConfig[hostName].company}</p>
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
