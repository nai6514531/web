import React, { Component }from 'react'
import Promise from 'bluebird'
import _ from 'underscore'
import moment from 'moment'
import op from 'object-path'
import cx from 'classnames'
import md5 from 'md5';
import querystring from 'querystring'
import { Table, Button, message, Form, Tabs, Modal, Input, Spin, Row, Col } from 'antd'
const FormItem = Form.Item
const createForm = Form.create
const TabPane = Tabs.TabPane
const confirm = Modal.confirm

import UserService from '../../../../../services/soda-manager/user'
import CommonService from '../../../../../services/common'
import Throttle from '../../../../../components/throttle'
import styles from '../index.pcss'

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

class Detial extends Component {
  static defaultProps = {
    loading: false
  }
  constructor(props) {
    super(props)
    this.state = {
      loading: this.props.loading
    }
  }
  componentWillReceiveProps(nextProps) {
    let nextLoading = op.get(nextProps, 'loading')
    let loading = op.get(this.props, 'loading')

    if (nextLoading !== loading) {
      this.setState({ loading: nextLoading })
    }
  }
  handleConfirmBlur (e) {
    const value = e.target.value;
    this.setState({ confirmDirty: !!value });
  }
  checkPassword(rule, value, callback) {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致');
    } else {
      callback();
    }
  }
  checkConfirm(rule, value, callback) {
    const { form: { validateFields } } = this.props;
    if (value && this.state.confirmDirty) {
      validateFields(['confirm'], { force: true });
    }
    callback();
  }
  cancel() {
    let { loading } = this.props
    if (loading) {
      return
    }
    confirm({
      title: '确定取消?',
      onOk() {
        history.go(-1);
      },
    });
  }
  handleSubmit(e) {
    e.preventDefault();
    let { form: { validateFieldsAndScroll }, isAdd, isSub } = this.props
    let { loading } = this.state

    validateFieldsAndScroll((errors, values) => {
      if (errors || loading) {  
        return 
      }
      let options = {
        account: values.account,
        password: md5(values.password || ''),
        name: values.name,
        contact: values.contact,
        mobile: values.mobile,
        telephone: values.telephone,
        address: values.address,
        smsCode: values.smsCode
      }
      if (isAdd) {
        return this.createAccount(_.omit(options, 'smsCode'))
      }
      this.updateAccount(_.omit(options, 'password'))
    })
  }
  createAccount(options) {
    this.setState({ loading: true })

    UserService.add(options).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        loading: false
      })
      this.props.history.push(`/soda/business/account/sub`)
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  updateAccount(options) {
    let { id } = this.props.match.params
    id = +id
    let { isAdd, isSub, redirectUrl } = this.props
    this.setState({ loading: true })

    UserService.update({...options, id: id}, id ).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        loading: false
      })
      if (redirectUrl) {
        return this.props.history.push(redirectUrl)
      }
      if (isSub) {
        return this.props.history.push(`/soda/business/account/sub`)
      }
      this.props.history.push(`/soda/business/account`)
    }).catch((err) => {
      this.setState({ loading: false })
      this.props.form.setFieldsValue({ smsCode: '' })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  handleClickCounter() {
    let { smsLoading } = this.state
    let { detail: { id } } = this.props
    if (smsLoading) {
      return
    }
    CommonService.sms({
      motivation: 'RESET_USER',
      userId: id
    }).then((res) => {
      this.props.form.setFieldsValue({ smsCode: '' })
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({
        startedAt: +new Date(),
        smsLoading: false
      })
    }).catch((err) => {
      this.props.form.setFieldsValue({ smsCode: '' })
      this.setState({
        startedAt: +new Date(),
        smsLoading: false
      })
      // this.setState({ smsLoading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  render() {
    let { form: { getFieldDecorator }, startedAt, smsLoading, detail: { account, name, contact, mobile, telephone, address, type }, isAdd, isSub } = this.props
    let { loading } = this.state

    return (<Spin spinning={loading}><Form onSubmit={this.handleSubmit.bind(this)}>
      {!isAdd ? <FormItem
        {...formItemLayout}
        label="登录账号" >
        {getFieldDecorator('account', {
          rules: [
            {required: true, message: '必填'},
            {max:30, message: '不超过三十个字' },
          ],
          initialValue: account,
        })(
            <Input disabled placeholder="请输入登录账号" /> 
        )}
      </FormItem> : null}
      {isAdd ? <FormItem
        {...formItemLayout}
        label="登录账号" >
        {getFieldDecorator('account', {
          rules: [
            {required: true, message: '必填'},
            {type: 'string', pattern: /^[a-zA-Z0-9]{5,15}$/, message: '新增账号名只能包含字母或数字，长度为5到15位'}
          ],
          initialValue: account,
        })(
          <Input placeholder="请输入登录账号" />
        )}
      </FormItem> : null}
      {isAdd ? <FormItem
        {...formItemLayout}
        label="密码">
        {getFieldDecorator('password', {
          rules: [
            {required: true, message: '必填'},
            {validator: this.checkConfirm.bind(this)}
           ],
        })(
          <Input type="password" placeholder="请输入密码" onBlur={this.handleConfirmBlur.bind(this)} />
        )}
      </FormItem> : null }
      {isAdd ? <FormItem
        {...formItemLayout}
        label="确认密码">
        {getFieldDecorator('confirm', {
          rules: [
            { required: true, message: '请确认密码' }, 
            { validator: this.checkPassword.bind(this) }
          ],
        })(
          <Input type="password" placeholder="请确认密码"/>
        )}
      </FormItem> : null}
      <FormItem
        {...formItemLayout}
        label="运营商名称" >
        {getFieldDecorator('name', {
          rules: [
            { required: true, message: '必填' },
            { max:30, message: '不超过三十个字' },
          ],
          initialValue: name,
        })(
          <Input placeholder="请输入运营商名称" />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="联系人" >
        {getFieldDecorator('contact', {
          rules: [
            { required: true, message: '必填' },
            { max:30, message: '不超过三十个字' },
          ],
          initialValue: contact,
        })(
          <Input placeholder="请输入联系人" />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="地址" >
        {getFieldDecorator('address', {
          rules: [
            { required: true, message: '必填' },
            { max:30, message: '不超过三十个字' },
          ],
          initialValue: address,
        })(
          <Input placeholder="请输入地址" />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="手机号" >
        {getFieldDecorator('mobile', {
          rules: [
            { len: 11, message: '请输入11位手机号' },
            { required: true, message: '必填' },
            { type: 'string', pattern: /^1\d{10}$/, message: '请输入正确的手机号'}
          ],
          initialValue: mobile,
        })(
          <Input placeholder="请输入手机号" />
        )}
      </FormItem>
      { !isAdd && type === 0 ? <FormItem
          {...formItemLayout}
          label="验证码"
          extra={mobile + '手机号验证'}
        > 
          <Row gutter={8}>
            <Col span={12}>
              {getFieldDecorator('smsCode', {
                rules: [
                  { required: true, message: '必填' },
                ],
                initialValue: '',
              })(
                <Input placeholder="请输入验证码" />
              )}
            </Col>
            <Col span={12}>
              <Throttle
                startedAt={this.state.startedAt}
                waitText={({ countdown }) => `重获验证码 (${countdown})`}
                className={styles.send}
                onClick={this.handleClickCounter.bind(this)}
                disabled={smsLoading}>
                <Button>发送验证码</Button>
              </Throttle>
            </Col>
          </Row>
        </FormItem> : null
      }
      <FormItem
        {...formItemLayout}
        label="服务电话" >
        {getFieldDecorator('telephone', {
          rules: [
            { required: true, message: '必填' },
            { max:30, message: '长度不超过三十位' },
            { type: 'string', pattern: /^[0-9\-]+$/, message: '请填写正确号码'}
          ],
          initialValue: telephone,

        })(
          <Input placeholder="请输入服务电话" />
        )}
      </FormItem>
      <FormItem {...tailFormItemLayout}>
        <Button style={{ marginRight: 10 }} type="ghost" onClick={this.cancel.bind(this)}>取消</Button>
        <Button type="primary" htmlType="submit">保存</Button>
      </FormItem>
    </Form></Spin>)
  }
}

export default createForm()(Detial)