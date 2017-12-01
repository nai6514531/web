import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import history from '../../../utils/history.js'

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
    title: '平台管理'
  },
  {
    title: '地址管理'
  },
  {
    title: '省'
  }
]

class Province extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      { title: '行政区划代码', dataIndex: 'id', key: 'id' },
      { title: '省', dataIndex: 'name',key: 'name' },
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
      type: 'province/list'
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.province.record.id
        let type = 'province/add'
        if(id) {
          type = 'province/update'
        }
        values.id = Number(values.id)
        this.props.dispatch({
          type: type,
          payload: { data: values, id }
        })
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'province/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'province/showModal',
      payload: {
        data: record
      }
    })
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'province/delete',
      payload: {
        id
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, province: { key, visible, record,  data: { objects, pagination } }, loading  } = this.props
    const title = record.id ? '编辑省' : '添加省'
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          onClick={this.show.bind(this,{})}
          style={{marginBottom: '20px', marginRight: 20}}
          >
          添加省
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={false}
          change={this.change}
        />
        <Modal
          title={title}
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          key={key}
         >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label='行政区划代码'
            >
              {getFieldDecorator('id', {
                rules: [{
                  required: true, message: '请输入行政区划代码',
                }],
                initialValue: record.id
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='省'
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入省',
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
    this.props.dispatch({ type: 'province/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    province: state.province,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Province))
