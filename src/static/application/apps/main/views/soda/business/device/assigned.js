import React, {  Component } from 'react'
import _ from 'underscore'
import { Modal, Steps, Button, Form, Icon, message } from 'antd'
const { Step } = Steps
const { Item: FormItem, create: createForm } = Form

import UserService from '../../../../services/soda-manager/user'
import DeviceService from '../../../../services/soda-manager/device'

import { InputClear } from '../../../../components/form/input'

import styles from './index.pcss'

const STEPS = [{
    title: '填写运营商账号',
  }, {
    title: '验证运营商信息',
  }, {
    title: '完成',
  }
]

class Assigned extends Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 0,
      description: '',
      loading: false,
      user: {}
    }
  }
  next() {
    let { form: { validateFieldsAndScroll } } = this.props
    let { loading, current } = this.state

    if (loading) {
      return
    }
    // 第一步获取商家信息
    if (current === 0) {
      return validateFieldsAndScroll((errors, values) => {
        if (errors) {  
          return 
        }
        this.getUserDetail(values.account)
      })
    }
    if (current !== 0 && current !== (STEPS.length -1)) {
      return this.assigned()
    }
    
  }
  prev() {
    let { current, loading } = this.state
    if (loading) {
      return
    }
    this.setState({ current: current === 0 ? 0 : --current })
  }
  assigned() {
    let { serials } = this.props
    let { user, current } = this.state
    this.setState({ loading: true })

    DeviceService.assigned({ 
      serials: serials, 
      user: { 
        id: user.id 
      } 
    }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      current++
      this.setState({
        loading: false,
        current: current
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getUserDetail(account) {
    let { current } = this.state
    this.setState({ loading: true })

    UserService.adminUserlist({ account: account }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { objects } = res.data
      let user = _.findWhere(objects, { account: account }) || {}
      if (_.isEmpty(user)) {
        this.setState({ loading: false, user: {} })
        return message.error('该用户不存在')
      }
      current++
      this.setState({
        loading: false,
        current: current,
        user: _.pick(user, 'id', 'mobile', 'name', 'contact', 'account')
      })
    }).catch((err) => {
      this.setState({ loading: false, user: {} })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  render () {
    let { form: { getFieldDecorator } } = this.props
    let { user, current, description, loading } = this.state
    let { serials } = this.props

    return (<Modal 
      visible={true}
      maskClosable={false}
      footer={null}
      onCancel={this.props.toggleVisible}
      className={styles.assigned}>
      <Steps current={current} className={styles.step}>
        {
          STEPS.map((item, index) => {
            return <Step key={item.title} title={item.title} description={current === index ? description : ''} />
          })
        }
      </Steps>
      { 
        current === 0 ?  <div className={styles.content}>
          <p>您已选择<span className={styles.hightlight}>{serials.length}</span>个设备进行分配,请输入被分配运营商的登录账号</p>
          <Form>
            <FormItem style= {{ width: '60%', margin: '0 auto' }}>
              {getFieldDecorator('account', {
                rules: [
                  {required: true, message: '请输入运营商的登录账号'},
                ],
                initialValue: user.account || '',
              })(
                <InputClear placeholder="请输入运营商的登录账号"  />
              )}
            </FormItem>
          </Form>
        </div> : current === 1 ? <div className={styles.content}>
          <p>你将把设备分配给：{user.name}|{user.contact}|{user.mobile}，是否继续？</p>
        </div> : current === 2 ? <div className={styles.content}>
          <div><Icon type="check-circle" className={styles.icon} /></div>
          <p>分配成功</p>
        </div> : null
      }
      <div className={styles.action}>
        {
          current < STEPS.length - 1 ?
          <Button type="primary" onClick={() => this.next()} loading={loading} >下一步</Button> : null
        }
        {
          current === STEPS.length - 1 ?
          <Button type="primary" onClick={this.props.toggleVisible("SUCCESS")}>完成</Button> : null
        }
        {
          current > 0 && current !== STEPS.length - 1 ?
          <Button style={{ marginLeft: 8 }} onClick={() => this.prev()} disabled={loading}>
            上一步
          </Button> : null
        }
      </div>
    </Modal>)
  }
}

export default createForm()(Assigned)