import React, { Component }from 'react'
import { Button, Modal, Spin, Icon, Row, Col, Form, message } from 'antd'
const FormItem = Form.Item;
const confirm = Modal.confirm;

import Breadcrumb from '../../../components/layout/breadcrumb'
import { Input } from '../../../components/form/input'
import ChipcardService from '../../../services/soda-manager/chipcard'

import styles from './index.pcss'

const conversionUnit = (value) => {
  return (value / 100).toFixed(2)
}

const breadItems = [
  {
    title: '商家系统'
  },
  {
    title: 'IC卡金额转移',
    url: '/business/recharges-chipcard'
  },
  {
    title: '查看IC卡信息'
  }
]
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 14,
      offset: 7,
    },
  },
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

class Detail extends Component {
  constructor(props) {
    super(props)

    this.state = {
      chipcard: {
      	chipcardId: '',
        mobile: '',
        value: 0,
        recharge: 0,
        apply: []
      },
      loading: false,
      updateLoading: false,
      visible: false
    }
  }
  componentDidMount() {
    this.getDetail()
  }
  getDetail() {
    let { id } = this.props.match.params
  	this.setState({ loading: true })

    ChipcardService.getDetail({ chipcardId: id }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        chipcard: data,
        loading: false
      })
    }).catch((err) => {
      this.setState({ 
        chipcard: {
          chipcardId: '',
          mobile: '',
          value: 0,
          recharge: 0,
          apply: []
        }, 
        loading: false 
      })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  handleSubmit(e) {
    e.preventDefault()
    let self = this
  	let { form: { validateFieldsAndScroll } } = this.props
  	let { chipcard: { chipcardId }, updateLoading } = this.state

  	validateFieldsAndScroll((err, values) => {
      if (err || updateLoading) {
        return
      }
      let options = {
      	chipcardId: chipcardId,
      	apply: _.without(values.apply.replace(/，/g,",").split(","), '')
      }
      confirm({
	      content: '是否确认修改?',
	      onOk() {
	        self.update(options);
	      }
	    })
    })
  }
  update(options) {
  	this.setState({ updateLoading: true })
  	ChipcardService.update(options).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({
        visible: false,
        updateLoading: false
      })
      this.getDetail()
    }).catch((err) => {
    	this.setState({ updateLoading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  render () {
    let { form: { getFieldDecorator } } = this.props
    let { chipcard: { mobile, value, recharge, apply }, loading, updateLoading, visible } = this.state
    let applySign = _.map(apply, (value) => { return `${value.name}(${value.account})` })

    return (<section>
      <Breadcrumb items={breadItems} />
      <div className={styles.detail}>
        <Spin spinning={loading}>
          <Row>
            <h2><Icon type="mobile" />学生登录手机号 {mobile}</h2>
          </Row>
          <Row>
            <h2>
              <Icon type="credit-card" />
              IC卡
              <Button type='primary' ghost size="small" icon='edit' onClick={() => { this.setState({ visible: true }) }}>修改适用商家</Button>
            </h2>
          </Row>
          <Row className={styles.info}>
            <Col xs={{ span: 23, offset: 1 }} sm={{ span: 7, offset: 1}} >
              <span>充值金额</span>
              <p>{conversionUnit(recharge) + '元'}</p>
            </Col>
            <Col xs={{ span: 23, offset: 1 }} sm={{ span: 7 }} className={styles.name}>
              <span>已消费金额</span>
              <p>{conversionUnit(recharge - value) + '元'}</p>
            </Col>
            <Col xs={{ span: 23, offset: 1 }} sm={{ span: 7 }}>
              <span>当前余额</span>
              <p>{conversionUnit(value) + '元'}</p>
            </Col>
          </Row>
          <Row className={styles.info}>
            <Col offset={1}>
              <span>适用商家</span>
            </Col>
          </Row>
          <Row className={styles.info}>
            { 
              applySign.map((value, index) => {
                if (index === 0) {
                  return <Col xs={{ span: 23, offset: 1 }} sm={{ span: 11, offset: 1 }} key={index} className={styles.apply}>{`${index + 1}. ${value}`}</Col>
                }
                return <Col xs={{ span: 23, offset: 1 }} sm={{ span: 11 }} key={index} className={styles.apply}>{`${index + 1}. ${value}`}</Col>
              })
            }
          </Row>
        </Spin>
      </div>
      <Modal
        footer={null}
        visible={visible}
        onCancel={() => { this.setState({ visible: false })}}>
        <Spin spinning={updateLoading}>
	        <Form onSubmit={this.handleSubmit.bind(this)} className={styles.form}>
	          <FormItem
	            {...formItemLayout}
	            label="适用商家账号">
	            {getFieldDecorator("apply", {
	              initialValue: _.map(apply, (value) => { return `${value.account}` }).join(','),
	              rules: [{
	                required: true, message: "账号不可为空",
	              }]
	            })(
	              <Input placeholder="如有多个账号，需用英文逗号隔开"/>
	            )}
	          </FormItem>
	          <FormItem {...tailFormItemLayout}>
			        <p className={styles.tip}>注意:该学生手机号之前充值对应的适用商家也将更新为此次修改结果！</p>
			      </FormItem>
	          <FormItem {...tailFormItemLayout} style={{textAlign: "center"}}>
			        <Button type="primary" htmlType="submit" >修改</Button>
			      </FormItem>
	        </Form>
        </Spin>
     </Modal>
    </section>)
  }
}

export default Form.create()(Detail)
