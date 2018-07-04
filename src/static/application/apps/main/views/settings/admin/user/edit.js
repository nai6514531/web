import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Input, Button, Radio, Collapse, Tag, AutoComplete, TreeSelect } from 'antd'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import md5 from 'md5'
import { find } from 'lodash'

const FormItem = Form.Item
const Panel = Collapse.Panel
const Option = AutoComplete.Option

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
        type: 'adminUser/detail',
        payload: {
          id: id
        }
      })
    }
    this.fetch()
  }
  fetch = () => {
    this.props.dispatch({
      type: 'adminUser/menuPermission'
    })
  }
  fetchAssignedPermission = (id) => {
    this.props.dispatch({
      type: 'adminUser/getAssignedPermission',
      payload: {
        data: {
          roleId: id
        }
      }
    })
  }
  fetchRole = (params) => {
    this.props.dispatch({
      type: 'adminUser/roles',
      payload: {
        data: params
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history } = this.props
        let type = 'adminUser/add'
        if(id !== 'new') {
          type = 'adminUser/update'
        } else {
          values.password = md5(values.password)
          values.rePassword = md5(values.rePassword)
        }
        values.parentId = Number(values.parentId)
        values.roleIds = [Number(values.roleIds)]
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
  changeHandler = (roleId) => {
    // 获取不同角色对应的权限
    if(roleId !== undefined) {
      this.fetchAssignedPermission(roleId)
    } else {
      this.props.dispatch({
        type: 'adminUser/updateData',
        payload: { permissionData: []}
      })
    }
    this.props.dispatch({
      type: 'adminUser/updateData',
      payload: { activeKey: ""}
    })
  }
  collapseHandler = (activeKey) => {
    this.props.dispatch({
      type: 'adminUser/updateData',
      payload: { activeKey: activeKey[activeKey.length - 1]}
    })
  }
  handleSelect = (e) => {
    const { adminUser: { filterUserData } } = this.props
    let user = find(filterUserData, (o) => Number(e) === o.id)
    this.props.dispatch({
      type: 'adminUser/updateData',
      payload: {
        disabled: false
      }
    })
    this.fetchRole({
      parentId: user && user.role && user.role.id
    })
  }
  handleSearch = _.debounce((filterKey) => {
    if(filterKey) {
      this.props.dispatch({
        type: 'adminUser/filterList',
        payload: {
          data: {
            fullAccount: filterKey,
            limit: 1
          }
        }
      })
      this.props.dispatch({
        type: 'adminUser/initRoleData'
      })
    }
  },1000)
  debounceSearch =(filterKey)=> {
    let disabled = filterKey ? true : false
    this.props.dispatch({
      type: 'adminUser/updateData',
      payload: {
        disabled
      }
    })
     this.handleSearch(filterKey)
  }
  render() {
    const { form: { getFieldDecorator }, adminUser: { filterUserData, detail, roleTree, roleData, permissionData, activeKey, disabled }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    const breadItems = [
      {
        title: '设置'
      },
      {
        title: '用户',
        url: `/admin/settings/user`
      },
      {
        title: isEdit ? '编辑用户': '新增用户'
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
        <Breadcrumb items={breadItems} location={this.props.location} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label='登录账号'
          >
            {getFieldDecorator('account', {
              rules: [{
                required: true, message: '请输入登录账号',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.account
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
                }, {
                  min: 6, message: '密码最少6位'
                }, {
                  validator: this.validateToNextPassword,
                }]
              })(
                <Input type='password'/>
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
                }, {
                  min: 6, message: '密码最少6位'
                }, {
                  validator: this.compareToFirstPassword,
                }]
              })(
                <Input type='password' onBlur={this.handleConfirmBlur}/>
              )}
            </FormItem>
          ) : null }
          <FormItem
            {...formItemLayout}
            label='用户名称'
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入用户名称',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.name
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='联系人'
          >
            {getFieldDecorator('contact', {
              rules: [{
                required: true, message: '请输入联系人',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.contact
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
              initialValue: detail.mobile
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
                max: 50, message: '长度最多50个字符'
              }],
              initialValue: detail.address
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
                required: true, message: '请输入服务电话',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.telephone
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="上级账户"
          >
            {getFieldDecorator('parentId', {
              rules: [{
                required: true, message: '请选择上级账户',
              }],
              initialValue: detail.parent && detail.parent.id + ''
            })(
              <AutoComplete
                disabled={isEdit}
                allowClear
                onSelect={this.handleSelect}
                onSearch={this.debounceSearch}>
                {
                  filterUserData.map((value) => {
                    return <Option value={value.id + ''} key={value.id}>{value.account}</Option>;
                  })
                }
              </AutoComplete>
            )}
          </FormItem>
          {
           <FormItem
                {...formItemLayout}
                label='角色'
              >
                {getFieldDecorator('roleIds', {
                  rules: [{
                    required: true, message: '请选择角色',
                  }],
                  initialValue: detail.role && [detail.role.id + '']
                })(
                  <TreeSelect
                    allowClear
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={roleTree}
                    placeholder="请选择角色搜索"
                    treeDefaultExpandAll
                    onChange={this.changeHandler}
                  />
                )}
            </FormItem>
          }
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
              disabled={disabled}
              onClick={this.handleSubmit}>
              保存
            </Button>
          </FormItem>
        </Form>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'adminUser/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    adminUser: state.adminUser,
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(UserEdit))
