import React, { Component }from 'react'
import { Button, Modal, Spin, Icon, Row, Col, Form, message, Card } from 'antd'
const FormItem = Form.Item;
const confirm = Modal.confirm;

import Breadcrumb from '../../../../components/layout/breadcrumb'
import { InputClear } from '../../../../components/form/input'

import ChipcardService from '../../../../services/soda-manager/chipcard'
import { conversionUnit } from '../../../../utils/functions'

import styles from './index.pcss'

const breadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '账号管理'
  },
  {
    title: '个人信息',
    url: '/soda/business/account'
  },
  {
    title: 'IC卡金额转移',
    url: '/soda/business/recharges-chipcard'
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
    apply = _.sortBy(apply, 'id')
    let applySign = _.map(apply, (value) => { return `${value.name}(${value.account})` })

    return (<section>
      <Breadcrumb items={breadItems} />
      <Card className={styles.card} type="inner" title='学生信息'>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}><label>登录手机号:</label><span>{mobile || '-'}</span></Col>
        </Row>
      </Card>
      <Card className={styles.card} type="inner" title='IC卡信息'>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}><label>充值金额:</label><span>{conversionUnit(recharge) + '元'}</span></Col>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}><label>已消费金额:</label><span>{conversionUnit(recharge - value) + '元'}</span></Col>
          <Col xs={{ span: 24 }} sm={{ span: 8 }}><label>当前余额:</label><span>{conversionUnit(value) + '元'}</span></Col>
        </Row>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 24 }}>
            <label>适用商家:</label>
            <span>
              {
                applySign.map((value, index) => {
                  return <i key={index} className={styles.name}>{`${index + 1}. ${value}`}</i>
                })
              }
            </span>
          </Col>
        </Row>
        <Row>
          <Col xs={{ span: 24 }} sm={{ span: 20 }}>
            <Button
              type='primary'
              style={{ marginRight: 10, marginTop: 10 }}
              onClick={() => { this.setState({ visible: true }) }}>
              修改适用商家
            </Button>
          </Col>
        </Row>
      </Card>
      {
        visible ?
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
  	              <InputClear placeholder="如有多个账号，需用英文逗号隔开"/>
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
       </Modal> : null
     }
    </section>)
  }
}

export default Form.create()(Detail)
