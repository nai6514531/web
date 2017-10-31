import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Button, Input, Avatar, Row, Col, Card, message, Modal, Spin } from 'antd'
import Breadcrumb from '../../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../../utils/'
import history from '../../../../../utils/history.js'
import styles from './index.pcss'
import { trim } from 'lodash'
import md5 from 'md5'
import moment from 'moment'
const confirm = Modal.confirm

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

class OperatorDetail extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
  }
  componentDidMount() {
    this.fetch()
  }
  fetch = () => {
    this.props.dispatch({
      type: 'crmOperatorDetail/detail',
      payload: {
        data: this.props.match.params.id
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'crmOperatorDetail/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'crmOperatorDetail/showModal'
    })
  }
  showConfirm = (values) => {
    const self = this
    const data = this.props.crmOperatorDetail.data
    const id = this.props.match.params.id
    confirm({
      content: `账号为${data.account}的密码将重置为${values.password},是否确认修改？`,
      onOk() {
        self.props.dispatch({
          type: 'crmOperatorDetail/updatePassword',
          payload: {
            data: {
              password: md5(values.password),
              id
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
    const { crmOperatorDetail: { data, key, visible }, loading, form: { getFieldDecorator } } = this.props
    const breadItems = [
      {
        title: '客服系统'
      },
      {
        title: '用户查询'
      },
      {
        title: 'B端用户',
        url: `/crm/search/operator?keywords=${this.search.keywords}`
      },
      {
        title: '运营商详情'
      }
    ]
    return(
      <div>
        <Breadcrumb items={breadItems} />
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
                <div className={styles['card-item']}>
                  <div><span className={styles.title}>运营商名称:</span>{data.name || '-'}</div>
                  <div><span className={styles.title}>用户ID:</span>{data.id || '-'}</div>
                  <div><span className={styles.title}>注册时间:</span>{moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss') || '-'}</div>
                  <div><span className={styles.title}>手机号:</span>{data.mobile || '-'}</div>
                  <div><span className={styles.title}>地址:</span><span className={styles.overText}>{data.address || '-'}</span></div>
                </div>
                <div className={styles.line}/>
                <div className={styles['card-item']}>
                  <div>
                    <span className={styles.title}>用户角色:</span>
                    {
                      !data.role.length ? '-' : data.role.map( (value, index) => {
                        return `${value.name}${data.role.length !== index + 1 ? ',' : ''}`
                      })
                    }
                  </div>
                  <div>
                    <span className={styles.title}>登录账号:</span>
                    <span className={styles.description}>{data.account || '-'}</span>
                    <a onClick={this.show}>修改密码</a>
                  </div>
                  <div><span className={styles.title}>联系人:</span>{data.contact || '-'}</div>
                  <div><span className={styles.title}>服务电话:</span>{data.telephone || '-'}</div>
                </div>
              </div>
            </Card>
            <Card className={styles.card}>
              <div className={styles.header}>
                  <h1>上下级账号信息</h1>
              </div>
              <div className={styles['sub-card']}>
                <div className={styles['card-item']}>
                  {/* <div><span className={styles.title}>经销商:</span>{data.id || '-'}</div> */}
                  <div><span className={styles.title}>上级运营商:</span>{data.parent.name || '-'}</div>
                  {/* <div><span className={styles.title}>主账号:</span>{data.createdAt || '-'}</div> */}
                  {/* <div><span className={styles.title}>员工账号:</span>{data.school || '-'}</div> */}
                </div>
                <div className={styles.line} />
                <div className={styles['card-item']}>
                  {/* <div><span className={styles.title}>联系方式:</span>{data.wechatName || '-'}</div> */}
                  <div><span className={styles.title}>联系方式:</span>{data.parent.mobile || '-'}</div>
                </div>
              </div>
            </Card>
            <Card className={styles.card}>
              <div className={styles.header}>
                  <h1>设备信息</h1>
              </div>
              <div className={styles['sub-card']}>
                <div className={styles['card-item']}>
                  <span className={styles.title}>设备数量:</span>
                  <span className={styles.description}>{data.deviceCount || '-'}</span>
                  {/* <a onClick={this.show}>查看</a> */}
                </div>
              </div>
            </Card>
            <Card className={styles.card}>
              <div className={styles.header}>
                  <h1>收款信息</h1>
              </div>
              <div className={styles['sub-card']}>
                <div className={styles['card-item']}>
                  <div><span className={styles.title}>是否自动结算:</span>{data.autoSettle || '-'}</div>
                  <div><span className={styles.title}>收款方式:</span>{data.payment || '-'}</div>
                  <div><span className={styles.title}>{`姓名\u00A0 | \u00A0账号:`}</span>{data.cashAccount || '-'}</div>
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
    this.props.dispatch({ type: 'crmOperatorDetail/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    crmOperatorDetail: state.crmOperatorDetail,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(OperatorDetail))
