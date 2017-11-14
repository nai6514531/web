import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Button, Avatar, Row, Col, Card, message, Modal, Spin, Input } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import history from '../../../../utils/history.js'
import styles from './index.pcss'
import { trim } from 'lodash'
import md5 from 'md5'
import moment from 'moment'
import InputWithClear from '../../../../components/input-with-clear/'
const confirm = Modal.confirm

const breadItems = [
  {
    title: '客服系统'
  },
  {
    title: '用户查询'
  },
  {
    title: 'C端用户'
  }
]
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
class Customer extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
  }
  componentDidMount() {
    const { mobile } = this.search
    if(mobile) {
      this.fetch(mobile)
    }
  }
  changeHandler = (type, value) => {
    if(value) {
      this.search = { ...this.search, [type]: trim(value) }
    } else {
      delete this.search[type]
    }
  }
  searchClick = () => {
    const { mobile } = this.search
    if(!mobile) {
      message.info('请输入筛选条件')
      return
    }
    if(mobile.length !== 11) {
      message.info('用户不存在，请重新查询')
      return
    }
    const queryString = toQueryString({ ...this.search })
    history.push(`${location.pathname}?${queryString}`)
    this.fetch(mobile)
  }
  fetch = (mobile) => {
    this.props.dispatch({
      type: 'crmCustomer/list',
      payload: {
        data: mobile
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'crmCustomer/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'crmCustomer/showModal'
    })
  }
  showConfirm = (values) => {
    const self = this
    const data = this.props.crmCustomer.data
    confirm({
      content: `账号为${data.mobile}的密码将重置为${values.password},是否确认修改？`,
      onOk() {
        self.props.dispatch({
          type: 'crmCustomer/updatePassword',
          payload: {
            data: {
              password: md5(values.password),
              mobile: data.mobile
            }
          }
        })
      },
      onCancel() {},
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        this.showConfirm(values)
      }
    })
  }
  render() {
    const { crmCustomer: { data, key, visible }, loading, form: { getFieldDecorator } } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <InputWithClear
          placeholder='请输入用户手机号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'mobile')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.mobile}
         />
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            >
            查询
          </Button>
        </span>
        {
          data ?
          <Spin
            tip='加载中...'
            spinning={loading}
            className={styles.wrap}>
            <Card className={styles.card}>
              <div className={styles.header}>
                  <h1>基本信息</h1>
              </div>
              <div className={styles['sub-card']}>
                <Avatar className={styles.avatar} src={data.avatorUrl} />
                <div className={styles['text-wrapper']}>
                  <h2>{data.nickName}</h2>
                  <div className={styles['card-item']}>
                    <div><span className={styles.title}>用户id:</span>{data.id || '-'}</div>
                    <div><span className={styles.title}>学校:</span>{data.school || '-'}</div>
                    <div><span className={styles.title}>注册时间:</span>{moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss') || '-'}</div>
                  </div>
                  <div className={styles.line}/>
                  <div className={styles['card-item']}>
                    <div>
                      <span className={styles.title}>登录手机号:</span>
                      <span className={styles.description}>{data.mobile || '-'}</span>
                      <a onClick={this.show}>修改密码</a>
                    </div>
                    <div><span className={styles.title}>微信昵称:</span>{data.wechatName || '-'}</div>
                    <div><span className={styles.title}>微信OpenId:</span>{data.openId || '-'}</div>
                  </div>
                </div>
              </div>
            </Card>
            <Card className={styles.card}>
              <div className={styles.header}>
                  <h1>账户&消费信息</h1>
              </div>
              <div className={styles['sub-card']}>
                <div className={styles['card-item']}>
                  <div><span className={styles.title}>账户余额:</span><span className={styles.description}>{data.wallet && (data.wallet.value / 100).toFixed(2)}</span><Link to={`/crm/${data.mobile}/bill`}>明细</Link></div>
                  <div><span className={styles.title}>IC卡余额:</span><span className={styles.description}>{data.chipcardCount < 0 ? '无' : (data.chipcardCount / 100).toFixed(2)}</span><Link to={`/crm/${data.mobile}/chipcard`}>明细</Link></div>
                  <div><span className={styles.title}>常用服务地点:</span>{data.recentAddress || '-'}</div>
                  <div><span className={styles.title}>最近订单:</span><span className={styles.description}>{data.lastTicketResume || '-'}</span></div>
                </div>
              </div>
            </Card>
          </Spin> : null
        }
        <Modal
          title='修改密码'
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          key={key}
         >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label='密码'
            >
              {getFieldDecorator('password', {
                rules: [{
                  required: true, message: '密码不可为空',
                },{
                  min: 6, message: '请输入6-16位密码'
                },{
                  max: 16, message: '请输入6-16位密码'
                }],
                initialValue: '123456'
              })(
                <Input />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'crmCustomer/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    crmCustomer: state.crmCustomer,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Customer))
