import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import ActionModal from './actionModal.js'
import ElementModal from './elementModal.js'
import MenuModal from './menuModal.js'
import PermissionModal from './permissionModal.js'
const breadItems = [
  {
    title: '设置'
  },
  {
    title: '权限'
  }
]

class Permission extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '权限名称', dataIndex: 'name',key: 'name' },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>修改|</a>
              <Popconfirm title="确认删除?" onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除|</a>
              </Popconfirm>
              <a href='javascript:void(0)' onClick={ this.showMenu.bind(this, record.id) }>{'\u00A0'}配置菜单|</a>
              <a href='javascript:void(0)' onClick={ this.showElement.bind(this, record.id) }>{'\u00A0'}配置元素|</a>
              <a href='javascript:void(0)' onClick={ this.showAction.bind(this, record.id) }>{'\u00A0'}配置接口</a>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'permission/list'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'permission/showModal',
      payload: {
        data: record
      }
    })
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'permission/delete',
      payload: {
        id: id
      }
    })
  }
  showMenu = (id) => {
    this.props.dispatch({
      type: 'permission/menu',
      payload: { id }
    })
  }
  showAction = (id) => {
    this.props.dispatch({
      type: 'permission/action',
      payload: { id }
    })
  }
  showElement = (id) => {
    this.props.dispatch({
      type: 'permission/element',
      payload: { id }
    })
  }
  render() {
    const { permission: { key, visible, record, data: { objects } }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          onClick={this.show.bind(this,{})}
          style={{marginBottom: '20px'}}
          >
          添加权限
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={false}
        />
        <PermissionModal {...this.props}/>
        <ActionModal {...this.props}/>
        <MenuModal {...this.props}/>
        <ElementModal {...this.props}/>
      </div>
    )
  }
}
function mapStateToProps(state,props) {
  return {
    permission: state.permission,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Permission)
