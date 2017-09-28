import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Button, Input, Avatar, Row, Col, Card, message, Modal, Spin } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import history from '../../../../utils/history.js'
import styles from './index.pcss'
import { trim } from 'lodash'
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
    const { cellphone } = this.search
    if(cellphone) {
      this.fetch(cellphone)
    }
  }
  changeHandler = (type, e) => {
    if(e.target.value) {
      this.search = { ...this.search, [type]: trim(e.target.value) }
    } else {
      delete this.search[type]
    }
  }
  searchClick = () => {
    const { cellphone } = this.search
    if(!cellphone || cellphone.length !== 11) {
      message.info('用户不存在，请重新查询')
      return
    }
    const queryString = toQueryString({ ...this.search })
    history.push(`${location.pathname}?${queryString}`)
    this.fetch(cellphone)
  }
  fetch = (cellphone) => {
    this.props.dispatch({
      type: 'crmCustomer/list',
      payload: {
        data: cellphone
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
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        this.props.dispatch({
          type: 'crmCustomer/updatePassword',
          payload: {
            data: {
              password: values.password,
              mobile: '12334556667777'
            }
          }
        })
      }
    })
  }
  render() {
    const { crmCustomer: { data, key, visible }, loading, form: { getFieldDecorator } } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Input
          placeholder='请输入用户手机号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'cellphone')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.cellphone}
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
              <h1>基本信息</h1>
              <div className={styles['sub-card']}>
                <Avatar className={styles.avatar} src='http://static.sodalife.xyz/soda/test/2.sodalife.xyz/topic/9298ea748b57f00ff84c59c5c9b4a181.JPG'>U</Avatar>
                <div className={styles['text-wrapper']}>
                  <h2>{data.nickName}</h2>
                  <div className={styles['card-item']}>
                    <div><span className={styles.title}>用户id:</span>{data.id || '-'}</div>
                    <div><span className={styles.title}>学校:</span>{data.school || '-'}</div>
                    <div><span className={styles.title}>注册时间:</span>{data.createdAt || '-'}</div>
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
              <h1>账户&消费信息</h1>
              <div className={styles['sub-card']}>
                <div className={styles['card-item']}>
                  <div><span className={styles.title}>账户余额:</span><span className={styles.description}>{(data.walletCount / 100).toFixed(2)}</span><Link to={`/crm/wallet/${data.mobile}`}>明细</Link></div>
                  <div><span className={styles.title}>IC卡余额:</span><span className={styles.description}>{(data.chipcardCount / 100).toFixed(2)}</span><Link to={`/crm/chipcard/${data.mobile}`}>明细</Link></div>
                  <div><span className={styles.title}>常用服务地点:</span>{data.recentAddress}</div>
                  <div><span className={styles.title}>最近订饭:</span><span className={styles.description}>{data.lastTicketResume}</span><a>明细</a></div>
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
                  required: true, message: '请输入密码!',
                },{
                  min: 6, message: '长度最少6个字符'
                },{
                  max: 16, message: '长度最多16个字符'
                }],
                initialValue: 123456
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
