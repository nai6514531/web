import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import styles from './index.pcss'

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
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: 'key', dataIndex: 'key',key: 'key' },
      { title: '控制器名称', dataIndex: 'name',key: 'name' },
      { title: 'path', dataIndex: 'path',key: 'path' },
      { title: '请求方法', dataIndex: 'method',key: 'method' },
      // {
      //   title: '操作',
      //   key: 'operation',
      //   render: (text, record, index) => {
      //     return (
      //       <span>
      //         <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>编辑</a> |
      //         <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
      //           <a href='javascript:void(0)'>{'\u00A0'}删除</a>
      //         </Popconfirm>
      //       </span>
      //     )
      //   }
      // }
    ]
  }
  componentDidMount() {
    const url = transformUrl(location.search)
    this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'action/list',
      payload: {
        data: url
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.action.record.id
        const url = transformUrl(location.search)
        let type = 'action/add'
        if(id) {
          type = 'action/update'
        }
        this.props.dispatch({
          type: type,
          payload: { data: values, id, url }
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
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'action/delete',
      payload: {
        id,
        url
      }
    })
  }
  changeHandler =  (type, e) => {
    this.search = { ...this.search, [type]: e.target.value }
  }
  searchClick = () => {
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    this.props.history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  change = (url) => {
   this.fetch(url)
  }
  render() {
    const { form: { getFieldDecorator }, action: { key, visible, record,  data: { objects, pagination } }, loading  } = this.props
    const title = record.id ? '编辑api' : '添加api'
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Input
          placeholder='key'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'key')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.key}
         />
        <Input
          placeholder='名称'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.method}
         />
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            搜索
          </Button>
          {/* <Button
            type='primary'
            onClick={this.show.bind(this,{})}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            添加接口
          </Button> */}
        </span>
        <DataTable
          scroll={{ x: 1000 }}
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
          key={key}
         >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label='控制器名称'
            >
              {getFieldDecorator('key', {
                rules: [{
                  required: true, message: '请输入控制器名称!',
                }],
                initialValue: record.key
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='api'
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
              label='请求方法'
            >
              {getFieldDecorator('method', {
                rules: [{
                  required: true, message: '请输入请求方法!',
                }],
                initialValue: record.method
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='描述'
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
  componentWillUnmount() {
    this.props.dispatch({ type: 'action/clear'})
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
