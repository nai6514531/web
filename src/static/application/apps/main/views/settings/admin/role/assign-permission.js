import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm, Tag, Table, Checkbox, Row, Col } from 'antd'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import styles from '../../../../assets/css/search-bar.pcss'
import './index.css'

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

class App extends Component {
  constructor(props) {
    super(props)
    this.breadItems = [
      {
        title: '设置'
      },
      {
        title: '角色',
        url: '/admin/settings/admin-role'
      }
      ,
      {
        title: `给${transformUrl(location.search).name}分配权限`
      }
    ]

    this.columns = [
      { title: '菜单名', dataIndex: 'name',key: 'name', className: 'td-left' },
      {
        title: '权限名',
        width: 700,
        className: 'td-left',
        render: (text, record, index) => {
          if(!record.permission.length) {
            return (
              <span></span>
            )
          }
          return (
            <span>
               {
                <Checkbox.Group style={{ width: '100%' }} onChange={this.checkboxChangeHandler.bind(this, record.id)} value={record.checkedList}>
                  <Row>
                    {
                      record.permission.map( value =>
                      <Col span={12} key={value.id}>
                        <Checkbox disabled={record.disabled} value={value.id}>{value.name}</Checkbox>
                      </Col> )
                    }
                  </Row>
                </Checkbox.Group>
               }
            </span>
          )
        }
      },
      {
        title: '操作',
        render: (text, record, index) => {
          const { loading } = this.props
          return (
            <span>
                <Checkbox
                  disabled={record.disabled}
                  indeterminate={record.indeterminate}
                  onChange={this.onCheckAllChange.bind(this, record.id)}
                  checked={record.checkAll}
                  >
                    全选
                </Checkbox>
                {
                  record.disabled ?
                  <Button size='small' type="primary" onClick={this.edit.bind(this, record.id)} disabled={loading}>修改</Button>
                  :<span>
                    <Button size='small' type="primary" onClick={this.save.bind(this, record.id)} style={{ marginRight: '10px' }} disabled={loading}>保存</Button>
                    <Button size='small' type="primary" onClick={this.cancel.bind(this, record.id)} disabled={loading}>取消</Button>
                  </span>
                }
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.fetch()
    this.fetchAssignedPermission()
  }
  fetch = () => {
    this.props.dispatch({
      type: 'adminAssignPermissions/menuPermission'
    })
  }
  fetchAssignedPermission = () => {
    this.props.dispatch({
      type: 'adminAssignPermissions/getAssignedPermission',
      payload: {
        data: {
          roleId: this.props.match.params.id,
        }
      }
    })
  }
  edit = (id) => {
    // 判断逻辑
    // 点击修改需要需要判断是否有保存按钮的状态，如果有则视为没有保存就点击修改按钮，需要重置状态
    this.props.dispatch({
      type: 'adminAssignPermissions/changeStatus',
      payload: {
        data: {
          id,
          disabled: false
        }
      }
    })
  }
  save = (id) => {
    this.props.dispatch({
      type: 'adminAssignPermissions/assign',
      payload: {
        data: {
          id,
          roleId: this.props.match.params.id
        }
      }
    })
  }
  cancel = (id) => {
    this.props.dispatch({
      type: 'adminAssignPermissions/cancel'
    })
  }
  onCheckAllChange = (id, e) => {
    this.props.dispatch({
      type: 'adminAssignPermissions/checkAll',
      payload: {
        data: {
          indeterminate: false,
          checkAll: e.target.checked,
          id: id
        }
      }
    })
  }
  checkboxChangeHandler = (id, checkedList) => {
    const { adminAssignPermissions: { menuPermissionData }, loading  } = this.props
    this.props.dispatch({
      type: 'adminAssignPermissions/changeCheckedList',
      payload: {
        data: {
          id,
          checkedList
        }
      }
    })
    // const {  group: { allPermission }  } = this.props
    // this.props.dispatch({
    //   type: 'group/updateData',
    //   payload: {
    //     checkedList: checkedList,
    //     indeterminate: !!checkedList.length && (checkedList.length < allPermission.length),
    //     checkAll: checkedList.length === allPermission.length,
    //   }
    // })
  }
  render() {
    const { form: { getFieldDecorator }, adminAssignPermissions: { menuPermissionData }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        <Table
          columns={this.columns}
          dataSource={menuPermissionData}
          bordered
          pagination={false}
          rowKey='id'/>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'adminAssignPermissions/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    adminAssignPermissions: state.adminAssignPermissions,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(App))
