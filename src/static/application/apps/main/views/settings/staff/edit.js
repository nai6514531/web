import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Input, Button, Radio, Collapse, Tag } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import md5 from 'md5'

const FormItem = Form.Item
const Panel = Collapse.Panel

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
    this.state = {
      confirmDirty: false,
    }
  }
  componentDidMount() {
    const { match: { params: { id } } } = this.props
    if(id !== 'new') {
      this.props.dispatch({
        type: 'user/detail',
        payload: {
          id: id
        }
      })
    }
    this.fetch()
    this.fetchRole()
  }
  fetch = () => {
    this.props.dispatch({
      type: 'user/menuPermission'
    })
  }
  fetchAssignedPermission = (id) => {
    this.props.dispatch({
      type: 'user/getAssignedPermission',
      payload: {
        data: {
          roleId: id
        }
      }
    })
  }
  fetchRole = (params) => {
    this.props.dispatch({
      type: 'user/roles'
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history, user: { data } } = this.props
        let type = 'user/add'
        if(id !== 'new') {
          type = 'user/update'
        } else {
          values.password = md5(values.password)
          values.rePassword = md5(values.rePassword )
        }
        values.roleIds = [values.roleId]
        delete values.roleId
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
  checkMobile = (rule, value, callback) => {
    if (isNaN(value) && value!== undefined) {
      callback('请输入正确的手机号')
    } else {
      callback()
    }
  }
  handleConfirmBlur = (e) => {
    const value = e.target.value
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && value !== form.getFieldValue('password')) {
      callback('两次密码输入不一致')
    } else {
      callback()
    }
  }
  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form
    if (value && this.state.confirmDirty) {
      form.validateFields(['rePassword'], { force: true })
    }
    callback()
  }
  changeHandler = (e) => {
    // 获取不同角色对应的权限
    this.props.dispatch({
      type: 'user/updateData',
      payload: { activeKey: ""}
    })
    this.fetchAssignedPermission(e.target.value)
  }
  collapseHandler = (activeKey) => {
    this.props.dispatch({
      type: 'user/updateData',
      payload: { activeKey: activeKey[activeKey.length - 1]}
    })
  }
  render() {
    const { form: { getFieldDecorator }, user: { data, roleData, permissionData, activeKey }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    const breadItems = [
      {
        title: '苏打生活'
      },
      {
        title: '账号管理'
      },
      {
        title: '员工账号',
        url: '/admin/settings/staff'
      },
      {
        title: isEdit ? '编辑账号': '新增账号'
      }
    ]
    const loop = data => data.map((item) => {
      return (
        <Panel header={item.name} key={item.id}>
          <div style={{paddingLeft: '30px'}}>
            { item.permission.map((value, index) =><Tag style={{ margin: '3px 8px'}} key={index}>{value.name}</Tag>) }
          </div>
        </Panel>
      )
    })
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
                required: true, message: '请输入登录账号',
              }],
              initialValue: data.account
            })(
              <Input disabled={isEdit}/>
            )}
          </FormItem>
          { !isEdit ? (
            <FormItem
              {...formItemLayout}
              label='密码'
            >
              {getFieldDecorator('password', {
                rules: [{
                  required: true, message: '请输入密码',
                },{
                  min: 6, message: '密码最少6位'
                },{
                  validator: this.validateToNextPassword,
                }]
              })(
                <Input />
              )}
            </FormItem>
          ) : null }
          { !isEdit ? (
            <FormItem
              {...formItemLayout}
              label='确认密码'
            >
              {getFieldDecorator('rePassword', {
                rules: [{
                  required: true, message: '请输入确认密码',
                },{
                  min: 6, message: '密码最少6位'
                }, {
                  validator: this.compareToFirstPassword,
                }]
              })(
                <Input  onBlur={this.handleConfirmBlur}/>
              )}
            </FormItem>
          ) : null }
          <FormItem
            {...formItemLayout}
            label='员工姓名'
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入员工姓名',
              }],
              initialValue: data.name
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
                required: true, message: '请输入手机号',
              }, {
                len: 11, message: '请输入11位长度的手机号',
              }, {
                validator: this.checkMobile,
              }],
              initialValue: data.mobile
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='角色'
          >
            {getFieldDecorator('roleId', {
              rules: [{
                required: true, message: '请选择角色',
              }],
              initialValue: data.role && data.role.id
            })(

              <Radio.Group onChange={this.changeHandler} style={{background: '#ffffff', width: '100%'}}>
                  {
                    roleData.map((item, index) => {
                      return(
                        <Radio value={item.id} style={{ minWidth: '30%', marginRight: '10px'}} key={index}>
                          {item.name}
                        </Radio>
                      )
                    })
                  }
              </Radio.Group>
            )}
          </FormItem>
          {
            permissionData.length != 0
            ? <FormItem
                {...formItemLayout}
                label='操作权限'
              >
                <Collapse bordered={false} activeKey={activeKey} onChange={this.collapseHandler}>
                  { loop(permissionData) }
                </Collapse>
              </FormItem>
            : null
          }
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
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(UserEdit))
