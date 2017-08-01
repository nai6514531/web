import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Cascader, Form, Modal, Input, Button, Popconfirm } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { storage } from '../../../utils/storage.js'
import { arrayToTree, transformMenu } from '../../../utils/'

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
    title: '菜单'
  }
]

class Menu extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '菜单名', dataIndex: 'name',key: 'name' },
      { title: '层级', dataIndex: 'level', key: 'level' },
      { title: '图标', dataIndex: 'icon', key: 'icon' },
      { title: '路由', dataIndex: 'url', key: 'url' },
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
      type: 'menu/list'
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { cascader } = values
        const id = this.props.menu.record.id
        let type = 'menu/add'
        values.parentId = cascader[cascader.length - 1]
        values.level = cascader.length
        if(id) {
          values.id = id
          type = 'menu/update'
        }
        this.props.dispatch({
          type: type,
          payload: {
            data: values
          }
        })
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'menu/hideModal'
    })
  }
  show = (record) => {
    // 暂时支持到三级菜单
    this.transformRecord(record)
    this.props.dispatch({
      type: 'menu/showModal',
      payload: {
        data: record
      }
    })
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'menu/delete',
      payload: {
        id: id
      }
    })
  }
  transformRecord = (record) => {
    const parentId = record.parentId
    const level = record.level
    if( level === 1 ) {
      record.cascader = [0] //present parentId
    } else {
      this.options[0].children.map( item  => {
        if( parentId === item.id && level === 2 ) {
          record.cascader = [0, parentId]
        }
        if(item.children) {
          item.children.map( subItem => {
            if( parentId === subItem.id ) {
              record.cascader = [0, subItem.parentId, parentId]
            }
          })
        }
      })
    }
  }
  render() {
    const { form: { getFieldDecorator }, menu: { key, visible, record, data: { objects, pagination } }, loading  } = this.props
    this.options = transformMenu(arrayToTree(objects))
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          onClick={this.show}
          style={{marginBottom: '20px'}}
          >
          添加菜单
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={false}
        />
        <Modal
          title="添加用户"
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          key={key}
         >
          <Form onSubmit={this.handleSubmit}>
              <FormItem
                {...formItemLayout}
                label="菜单名"
              >
                {getFieldDecorator('name', {
                  rules: [{
                    required: true, message: '请输入菜单名!',
                  }],
                  initialValue: record.name
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="图标"
              >
                {getFieldDecorator('icon', {
                  rules: [{
                    required: true, message: '请输入图标!',
                  }],
                  initialValue: record.icon
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="路由"
              >
                {getFieldDecorator('url', {
                  initialValue: record.url
                })(
                  <Input />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="根节点"
              >
                {getFieldDecorator('cascader', {
                  initialValue: record.cascader,
                  rules: [{
                    required: true, message: '请选择根节点',
                  }],
                })(
                  <Cascader options={this.options} changeOnSelect/>
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
    menu: state.menu,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Menu))
