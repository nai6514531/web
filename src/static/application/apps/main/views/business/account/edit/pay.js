import React, { Component }from 'react'
import Promise from 'bluebird'
import _ from 'underscore'
import moment from 'moment'
import op from 'object-path'
import cx from 'classnames'
import md5 from 'md5';
import querystring from 'querystring'
import QRCode from 'qrcode.react'

import { Radio, Button, message, Form, Modal, Spin, Icon, Row, Col, Checkbox, Input } from 'antd'
const FormItem = Form.Item
const createForm = Form.create
const RadioGroup = Radio.Group
const confirm = Modal.confirm

import { isProduction } from '../../../../utils/debug'
import UserService from '../../../../services/soda-manager/user'
import BusinessService from '../../../../services/soda-manager/business'
import CONSTANT from '../../constant'

import styles from '../index.pcss'
const DEFAULT_URL = isProduction ? 'http://m.sodalife.xyz/act/relate-wechat' : 'http://m.sodalife.club/act/relate-wechat';

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

class Code extends Component {
   constructor(props) {
    super(props)
  }
  render() {
    let { keyLoading, qrCodeUrl, wechat , detail: { nickName, cashAccount } } = this.props
    let url = DEFAULT_URL + `?key=${wechat.key}`

    return (<Row className={cx(styles.code, { [`${styles.loading}`]: keyLoading })} >
      <Col xs={24} sm={10} md={6}>
        <QRCode value={url} />
        {keyLoading ? <Spin className={styles.spin} /> : null}
      </Col>
      <Col xs={24} sm={14} md={16}>
        {!!wechat.nickName || (!wechat.key && cashAccount.type === CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT) ? <div className={styles.tip}>
          <Icon type='check-circle' className={cx(styles.check, styles.icon)} />
          <p>
            关联成功（你将使用昵称为
            <span className={styles.name}>{wechat.nickName || nickName}</span>
            的微信收款。如需更换账号请
            <span className={styles.refresh} onClick={this.props.createWechatKey}>刷新</span>
            二维码，用新微信号扫描）
          </p>
        </div> :
        <div className={styles.tip}>
          <Icon type='exclamation-circle' className={cx(styles.exclamation, styles.icon)} />
          <p>请使用你作为收款用途的微信扫描二维码进行关联，申请结算后，款项会在规定时间内打入微信账户。</p>
          <p>请确保自己的微信已实名认证<span className={styles.identify} onClick={this.props.toggleVisible}>如何认证?</span></p>
        </div>}
      </Col>
    </Row>)
  }
}

class Alipay extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showAccountTip: false,
      showAccountNameTip: false
    }
  }
  render() {
    let { form: { getFieldDecorator }, detail: { cashAccount } } = this.props

    return <div>
      <FormItem
        {...formItemLayout}
        label="支付宝账号">
        <Row gutter={8}>
          <Col span={12}>
            {getFieldDecorator('account', {
              rules: [
                {required: true,  message: '必填'},
                {max:30, message: '不超过三十个字'},
              ],
              initialValue: cashAccount.type === CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY ? cashAccount.account : '',

            })(
              <Input placeholder="邮箱或手机号" />
            )}
          </Col>
          <Col span={12}>
            <Button type="primary" className='form-wrapper-btn' onClick={() => { this.setState({ showAccountTip: true })}}>查看示例</Button>
          </Col>
        </Row>
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="真实姓名">
        <Row gutter={8}>
          <Col span={12}>
            {getFieldDecorator('realName', {
              rules: [
                {required: true, message: '必填'},
                {max:30, message: '不超过三十个字'},
              ],
              initialValue: cashAccount.type === CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY ? cashAccount.realName : '',

            })(
              <Input placeholder="必须为实名认证过的姓名" />
            )}
          </Col>
          <Col span={12}>
            <Button type="primary" className='form-wrapper-btn' onClick={() => { this.setState({ showAccountNameTip: true })}}>查看示例</Button>
          </Col>
        </Row>
      </FormItem>
      <Modal
        title="示例图片"
        footer={null}
        visible={this.state.showAccountTip}
        onCancel={() => { this.setState({ showAccountTip: false })}}
        style={{ textAlign:'center' }}>
        <img src={require("../images/pic_01.png")} width="70%"/>
     </Modal>
     <Modal
        title="示例图片"
        footer={null}
        visible={this.state.showAccountNameTip}
        onCancel={() => { this.setState({ showAccountNameTip: false })}}
        style={{ textAlign:'center' }}>
        <img src={require("../images/pic_02.png")} width="70%"/>
     </Modal>
    </div>
  }
}

class Wechat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }
  render() {
    let { form: { getFieldDecorator }, detail: { cashAccount }, wechat } = this.props
    let { visible } = this.state

    return <div>
      <FormItem
        {...formItemLayout}
        label='扫码验证身份'>
        {getFieldDecorator('qrcode', {
          rules: [
            {required: true}
          ],
          initialValue: 'qrcode'
        })(
          <Code {...this.props} toggleVisible={() => { this.setState({ visible: !visible })}} />
        )
        }
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="微信已认证姓名">
        {getFieldDecorator('realName', {
          rules: [
            {required: true, message: '必填'},
            {max:30, message: '不超过三十个字'},
          ],
          initialValue: cashAccount.type === CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT ? cashAccount.realName : '',

        })(
          <Input placeholder="如：张三" />
        )}
      </FormItem>
      <Modal
        title="如何认证"
        footer={null}
        visible={visible}
        onCancel={() => { this.setState({ visible: false })}}
        style={{ textAlign:'center' }}>
        <p>通过微信内选择【我】-> 【钱包】 -> 【···】 -> 【支付管理】 -> 【实名认证】-> 上传身份证进行实名。</p>
     </Modal>
    </div>
  }
}

class Pay extends Component {
  static defaultProps = {
    type: CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT,
    loading: false
  }
  constructor(props) {
    super(props)
    let { detail: { cashAccount }, loading } = this.props
    this.state = {
      loading: loading,
      keyLoading: false,
      type: cashAccount.type,
      wechat: {
        key: '',
        nickName: ''
      },
      isAuto: cashAccount.isAuto || true,
      qrCodeUrl: DEFAULT_URL
    }
  }
  componentWillReceiveProps(nextProps) {
    let nextType = op.get(nextProps, 'detail.cashAccount.type')
    let nextLoading = op.get(nextProps, 'loading')
    let type = op.get(this.props, 'detail.cashAccount.type')
    let loading = op.get(this.props, 'loading')

    if (nextLoading !== loading) {
      this.setState({ loading: nextLoading })
    }
    if (nextType !== type) {
      this.setState({ type: nextType })
    }
  }
  componentWillMount() {
    this.timer = null
  }
  componentWillUnmount() {
    clearInterval(this.timer)
    this.timer = null
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
      onCancel() {
      },
    });
  }
  handleSubmit(e) {
    e.preventDefault()
    let { form: { validateFieldsAndScroll } , isAdd, detail } = this.props
    let { type, wechat, loading } = this.state

    validateFieldsAndScroll((errors, values) => {
      if (errors || loading) {
        return
      }
      // 未选任何结算方式,对当前结算方式为银行表现兼容处理
      if (!~[CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT, CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY].indexOf(type)) {
          return message.error('请选择收款方式')
        }
      // 当前为修改微信账号状态，且未关联微信
      if (type === CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT　&& !!wechat.key && !wechat.nickName) {
        return message.error('请使用你作为收款用途的微信扫描二维码进行关联')
      }
      let options = {
        ...detail,
        cashAccount: {
          realName: values.realName,
          account: values.account,
          type: +values.type,
          isAuto: values.auto
        },
        nickName: wechat.nickName || detail.nickName
      }
      // 结算帐号为微信，且重新关连
      if (type === CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT　&& !!wechat.key ) {
        options = { ...options, wechat }
      }

      this.updateAccount(options)
    })
  }
  updateAccount(options) {
    let { id } = this.props.match.params
    let { isAdd, isSub, redirectUrl, parentId } = this.props
    this.setState({ loading: true })

    UserService.updateCashAccount({ ...options, id: +id }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({ loading: false })
      if (redirectUrl) {
        return this.props.history.push(redirectUrl)
      }
      if (isSub) {
        return this.props.history.push(`/business/account?parentId=${parentId}`)
      }
      return this.props.history.push(`/business/account`)
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  changeTye(type) {
    let { detail: { cashAccount } } = this.props

    if (type === this.state.type) {
      return
    }
    clearInterval(this.timer)
    this.timer = null
    this.setState({ type: type, wechat: { key: '', nickName: '' } })
    // 选择微信支付账户 且用户默认不是微信支付
    if (type === CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT && cashAccount.type !== CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT) {
      this.createWechatKey()
    }
  }
  createWechatKey() {
    let { id } = this.props.match.params
    this.setState({ keyLoading: true })

    BusinessService.createKey({id: +id}).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      let key = data.key
      this.setState({
        wechat: {
          nickName: '',
          key: key
        },
        keyLoading: false
      })
      this.checkWechatKey(key)
    }).catch(() => {
      this.setState({ keyLoading: false })
    })
  }
  checkWechatKey(key) {
    clearInterval(this.timer)
    this.timer = setInterval(() => {
      BusinessService.getKeyDetail(key).then((res) => {
        // 当前key未关联商家微信信息
        if (res.code === '02121601') {
          return
        }
        if (res.status !== 'OK') {
          throw new Error(res.message)
        }
        let data = res.data

        if (data.wechat.nickName) {
          clearInterval(this.timer);
          this.timer = null;

          this.setState({ wechat: { ...this.state.wechat, nickName: data.wechat.nickName } })
        }
      }).catch((error) => {
        clearInterval(this.timer);
        this.timer = null;
        console.log(error)
      })
    }, 3000)
  }
  render() {
    let { form: { getFieldDecorator }, detail: { cashAccount }, isAdd, isSub } = this.props
    let { type, qrCodeUrl, keyLoading, wechat, isAuto, loading } = this.state

    return (<Spin spinning={loading}>
      <Form className={styles.pay}>
        <FormItem
          {...formItemLayout}
          label="收款方式">
          {getFieldDecorator('type', {
            rules: [
              { required: true, message: '请选择收款方式' },
            ],
            initialValue: String(type)
          })(
            <RadioGroup>
              <Radio value="2" onClick={this.changeTye.bind(this, CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT)}>
                <span>微信(申请后T+1结算，收取结算金额的1%作为手续费)</span>
              </Radio>
              <Radio value="1" onClick={this.changeTye.bind(this, CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY)}>
                <span style={{ whiteSpace: 'initial' }}>
                  支付宝(申请后T+1结算，200元以下每次结算收取2元手续费，200元及以上收取结算金额的1%作为手续费)
                </span>
              </Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="是否自动结算" >
          {getFieldDecorator('auto', {
            initialValue: !!~[CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT, CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY].indexOf(cashAccount.type) ? cashAccount.isAuto : true,
            valuePropName: 'checked',
          })(
            <Checkbox>
              结算金额一旦超过200元，系统自动提交结算申请（若不勾选，
              结算时需手动点击结算查询的"申请结算"按钮，财务才会进行结算）</Checkbox>
          )}
        </FormItem>
        {
          type === CONSTANT.CASH_ACCOUNT_TYPE_IS_WECHAT ?
          <Wechat {...this.props}
          wechat={wechat}
          qrCodeUrl={qrCodeUrl}
          keyLoading={keyLoading}
          createWechatKey={this.createWechatKey.bind(this)} /> :
          type === CONSTANT.CASH_ACCOUNT_TYPE_IS_ALIPAY ?
          <Alipay {...this.props} /> : null
        }
        <FormItem {...tailFormItemLayout}>
          <Button style={{ marginRight: 10 }} type="ghost" onClick={this.cancel.bind(this)}>取消</Button>
          <Button type="primary" onClick={this.handleSubmit.bind(this)}>保存</Button>
        </FormItem>
      </Form>
    </Spin>)
  }
}

export default createForm()(Pay)
