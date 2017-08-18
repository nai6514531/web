import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import { Button, Modal, Form, Input, Checkbox, Col, Row, Popconfirm } from 'antd'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import DataTable from '../../../components/data-table/'

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
      type: 'role/hideModal'
    })
  }
  handleChange = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.role.record.id
        let type = 'role/add'
        if(id) {
          type = 'role/update'
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
  render() {
    const { form: { getFieldDecorator }, role: { key, visible, record } } = this.props
    const title = record.id ? '修改角色' : '添加角色'
    return(
      <Modal
        title={title}
        visible={visible}
        onCancel={this.hide}
        onOk={this.handleChange}
        key={key}
       >
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
class PermissionModal extends Component {
  constructor(props) {
    super(props)
    this.checkList = []
  }
  hide = () => {
    this.props.dispatch({
      type: 'role/hideModal'
    })
  }
  onChange = (values) => {
    this.checkList = values
  }
  handleSubmit = (e) => {
    this.props.dispatch({
      type: 'role/updatePermissions',
      payload: {
        id: this.props.role.currentId,
        data: this.checkList
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, role: { permissonData: { objects }, currentPermisson, permissionVisible, key } } = this.props
    this.checkList = currentPermisson
    return(
      <Modal
        title='配置权限'
        visible={permissionVisible}
        onCancel={this.hide}
        onOk={this.handleSubmit}
        key={key}
       >
        <Row>
          <Checkbox.Group onChange={this.onChange} defaultValue={currentPermisson}>
          {
            objects.map((item, index) => {
              return(
                <Col span={8} key={index}>
                    <Checkbox value={item.id} >
                      {item.name}
                    </Checkbox>
                </Col>
              )
            })
          }
          </Checkbox.Group>
        </Row>
      </Modal>
    )
  }
}
//表单分离

RoleModal = Form.create()(RoleModal)
PermissionModal = Form.create()(PermissionModal)

class Role extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      {
        title: '角色编号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '角色名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>修改 |</a>
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除 |</a>
              </Popconfirm>
              <a href='javascript:void(0)' onClick={ this.showPermission.bind(this,record.id) }>{'\u00A0'}配置权限</a>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'role/list'
    })
  }
  showPermission = (id) => {
    this.props.dispatch({
      type: 'role/permissions',
      payload: {
        id: id
      }
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'role/showModal',
      payload: {
        data: record
      }
    })
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'role/delete',
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
        <PermissionModal {...this.props} />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'role/clear'})
  }
}

function mapStateToProps(state,props) {
  return {
    role: state.role,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Role)
