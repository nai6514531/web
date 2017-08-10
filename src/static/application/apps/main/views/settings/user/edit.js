import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Input, Button } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import md5 from 'md5'

const FormItem = Form.Item
const breadItems = [
  {
    title: '设置'
  },
  {
    title: '用户设置',
    url: '/admin/settings/user'
  },
  {
    title: '编辑用户'
  }
]

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

class UserEdit extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const { match: { params: { id } } } = this.props
    id!== 'new' && this.props.dispatch({
      type: 'user/detail',
      payload: {
        id: id
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history } = this.props
        let type = 'user/add'
        if(id !== 'new') {
          type = 'user/update'
        } else {
          values.password = md5(values.password)
        }
        this.props.dispatch({
          type: type,
          payload: {
            history,
            data: values,
            id: id
          }
        })
      }
    })
  }
  cancelHandler = () => {
    this.props.history.goBack()
  }
  render() {
    const { form: { getFieldDecorator }, user: { data }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label='登录账号'
          >
            {getFieldDecorator('account', {
              rules: [{
                required: true, message: '请输入登录账号！',
              }],
              initialValue: data.account
            })(
              <Input disabled={isEdit}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='运营商名称'
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入运营商名称！',
              }],
              initialValue: data.name
            })(
              <Input />
            )}
          </FormItem>
          { !isEdit ? (
            <FormItem
              {...formItemLayout}
              label='密码'
            >
              {getFieldDecorator('password', {
                rules: [{
                  required: true, message: '请输入密码！',
                }]
              })(
                <Input />
              )}
            </FormItem>
          ) : null }
          <FormItem
            {...formItemLayout}
            label='联系人'
          >
            {getFieldDecorator('contact', {
              rules: [{
                required: true, message: '请输入联系人！',
              }],
              initialValue: data.contact
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='地址'
          >
            {getFieldDecorator('address', {
              rules: [{
                required: true, message: '请输入地址！',
              }],
              initialValue: data.address
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='手机号'
          >
            {getFieldDecorator('mobile', {
              rules: [{
                required: true, message: '请输入手机号！',
              }],
              initialValue: data.mobile
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='服务电话'
          >
            {getFieldDecorator('telephone', {
              rules: [{
                required: true, message: '请输入服务电话！',
              }],
              initialValue: data.telephone
            })(
              <Input />
            )}
          </FormItem>
          <FormItem style={{textAlign: 'center'}}>
            <Button
              style={{margin: '20px 50px 0 0'}}
              loading={loading}
              onClick={this.cancelHandler}>
              取消
            </Button>
            <Button
              type='primary'
              loading={loading}
              onClick={this.handleSubmit}>
              保存
            </Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}
function mapStateToProps(state,props) {
  return {
    user: state.user,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(UserEdit))
