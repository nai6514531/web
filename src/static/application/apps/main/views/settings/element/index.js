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
    title: '元素'
  }
]

class Element extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '元素名称', dataIndex: 'name',key: 'name' },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>编辑</a> |
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除</a>
              </Popconfirm>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.fetch()
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'element/list'
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.element.record.id
        let type = 'element/add'
        if(id) {
          type = 'element/update'
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
      type: 'element/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'element/showModal',
      payload: {
        data: record
      }
    })
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'element/delete',
      payload: {
        id: id
      }
    })
  }
  change = (url) => {
   // this.fetch(url)
  }
  reset = () => {
    const { resetFields, getFieldsValue } = this.props.form
    resetFields(Object.keys(getFieldsValue()))
  }
  render() {
    const { form: { getFieldDecorator }, element: { key, visible, record, data: { objects, pagination } }, loading  } = this.props
    const title = record.id ? '编辑元素' : '添加元素'
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          onClick={this.show.bind(this,{})}
          style={{marginBottom: '20px'}}
          >
          添加元素
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
        <Modal
          title={title}
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          afterClose={this.reset}
         >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label='元素名称'
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入元素名称!',
                }],
                initialValue: record.name
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
    this.props.dispatch({ type: 'element/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    element: state.element,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Element))
