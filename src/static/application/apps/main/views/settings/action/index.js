import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'

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
const breadItems = [
  {
    title: '设置'
  },
  {
    title: '接口'
  }
]

class Action extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '控制器名称', dataIndex: 'handlerName',key: 'handlerName' },
      { title: 'api', dataIndex: 'api',key: 'api' },
      { title: '请求方法', dataIndex: 'method',key: 'method' },
      { title: '描述', dataIndex: 'description',key: 'description' },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>修改</a> |
              <Popconfirm title="确认删除?" onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除</a>
              </Popconfirm>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'action/list'
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.action.record.id
        let type = 'action/add'
        if(id) {
          type = 'action/update'
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
  hide = () => {
    this.props.dispatch({
      type: 'action/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'action/showModal',
      payload: {
        data: record
      }
    })
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'action/delete',
      payload: {
        id: id
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, action: { key, visible, record, data }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          onClick={this.show.bind(this,{})}
          style={{marginBottom: '20px'}}
          >
          添加接口
        </Button>
        <DataTable
          dataSource={data}
          columns={this.columns}
          loading={loading}
          pagination={false}
        />
        <Modal
          title="添加api"
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          key={key}
         >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label="控制器名称"
            >
              {getFieldDecorator('handlerName', {
                rules: [{
                  required: true, message: '请输入控制器名称!',
                }],
                initialValue: record.handlerName
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="api"
            >
              {getFieldDecorator('api', {
                rules: [{
                  required: true, message: '请输入api名称!',
                }],
                initialValue: record.api
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="请求方法"
            >
              {getFieldDecorator('method', {
                rules: [{
                  required: true, message: '请输入权限名称!',
                }],
                initialValue: record.method
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="描述"
            >
              {getFieldDecorator('description', {
                rules: [{
                  required: true, message: '请输入描述!',
                }],
                initialValue: record.description
              })(
                <Input />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
}
function mapStateToProps(state,props) {
  return {
    action: state.action,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Action))
