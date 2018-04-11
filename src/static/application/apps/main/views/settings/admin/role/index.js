import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import { Link } from 'react-router-dom'
import { Button, Modal, Form, Input, Checkbox, Col, Row, Popconfirm } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import DataTable from '../../../../components/data-table/'
import './index.css'

const FormItem = Form.Item

const formItemLayoutWithCheckbox = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}

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
const breadItems = [
  {
    title: '设置'
  },
  {
    title: '角色'
  }
]
class RoleModal extends Component {
  hide = () => {
    this.props.dispatch({
      type: 'adminRole/hideModal'
    })
  }
  handleChange = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.role.record.id
        let type = 'adminRole/add'
        if(id) {
          type = 'adminRole/update'
        }
        this.props.dispatch({
          type: type,
          payload: {
            data: values,
            id: id
          }
        })
      }
    })
  }
  reset = () => {
    const { resetFields, getFieldsValue } = this.props.form
    resetFields(Object.keys(getFieldsValue()))
  }
  render() {
    const { form: { getFieldDecorator }, role: { key, visible, record } } = this.props
    const title = record.id ? '编辑角色' : '添加角色'
    return(
      <Modal
        title={title}
        visible={visible}
        onCancel={this.hide}
        onOk={this.handleChange}
        afterClose={this.reset}
       >
        {
          record.parentId !== 0 ?
          <Form>
            <FormItem
              {...formItemLayout}
              label='父节点'
            >
              {getFieldDecorator('parent', {
                rules: [{
                  required: true, message: '请输入父节点!',
                }],
                initialValue: '运营商'
              })(
                <Input disabled/>
              )}
            </FormItem>
          </Form>
          : null
        }
        <Form>
          <FormItem
            {...formItemLayout}
            label='角色名称'
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入角色名称!',
              }],
              initialValue: record.name
            })(
              <Input />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}


RoleModal = Form.create()(RoleModal)

class Role extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      // {
      //   title: '角色编号',
      //   dataIndex: 'id',
      //   key: 'id',
      // },
      {
        title: '角色名称',
        dataIndex: 'name',
        key: 'name',
        className: 'td-left',
        width: 300
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>编辑 |</a>
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除 | {'\u00A0'}</a>
              </Popconfirm>
              <Link
                to={`/admin/settings/admin-role/${record.id}/assign-permission?name=${record.name}`}>
                配置权限
              </Link>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'adminRole/list'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'adminRole/showModal',
      payload: {
        data: record
      }
    })
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'adminRole/delete',
      payload: {
        id: id
      }
    })
  }
  render() {
    const { role: { data }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          onClick={this.show.bind(this,{})}
          style={{marginBottom: '20px'}}
          >
          添加角色
        </Button>
        <DataTable
          dataSource={data || []}
          columns={this.columns}
          loading={loading}
          pagination={false}
        />
        <RoleModal {...this.props} />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'adminRole/clear'})
  }
}

function mapStateToProps(state,props) {
  return {
    role: state.adminRole,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Role)
