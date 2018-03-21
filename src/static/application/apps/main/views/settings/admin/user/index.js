import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal, Form, Input, Checkbox, Col, Row } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
// import RoleModal from './roleModal.js'
import styles from '../../../../assets/css/search-bar.pcss'

const Search = Input.Search
const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}
const breadItems = [
  {
    title: '设置'
  },
  {
    title: '用户'
  }
]
class User extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = {limit: 10, offset: 0, ...search }
    this.id = ''
    this.checkList = []
    this.columns = [
      {
        title: '用户编号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '用户名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '联系人',
        dataIndex: 'contact',
        key: 'contact',
      },
      {
        title: '手机号',
        dataIndex: 'mobile',
        key: 'mobile',
      },
      {
        title: '登录账号',
        dataIndex: 'account',
        key: 'account',
      },
      {
        title: '角色',
       render: (text, record, index) => {
         return (
          record.role[0] && record.role[0].name //只支持单角色
         )
       }
      },
      {
        title: '状态',
       render: (text, record, index) => {
         return (
          record.status === 0 ? '正常' : '拉黑'
         )
       }
      },
      {
        title: '地址',
        dataIndex: 'address',
        key: 'address',
      },
      // {
      //   title: '操作',
      //   key: 'operation',
      //   render: (text, record, index) => {
      //     return (
      //       <span>
      //         <Link to={`/admin/settings/admin-user/${record.id}`}>编辑</Link> |
      //         <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
      //           <a href='javascript:void(0)'>{'\u00A0'}删除</a>
      //         </Popconfirm>
      //         {/* <a href='javascript:void(0)' onClick={ this.show.bind(this,record.id) }>{'\u00A0'}配置角色</a> */}
      //       </span>
      //     )
      //   }
      // }
    ]
  }
  componentDidMount() {
    this.fetch(this.search)
  }
  fetch = (params) => {
    this.props.dispatch({
      type: 'adminUser/list',
      payload: {
        data: params
      }
    })
  }
  delete = (id) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'adminUser/delete',
      payload: {
        data: url,
        id: id
      }
    })
  }
  show = (id) => {
    this.id = id
    this.props.dispatch({
      type: 'adminUser/roles',
      payload: {
        id: id
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
    const { form: { getFieldDecorator }, user: { data: { objects, pagination }, key, visible }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Input
          placeholder='请输入用户名搜索'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.name}
         />
        <Input
          placeholder='请输入用户id搜索'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'id')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.id}
         />
        <Input
          placeholder='请输入账号搜索'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'account')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.account}
         />
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          >
          搜索
        </Button>
        {/* <Link
          to={`/admin/settings/admin-user/new`}>
          <Button
            type='primary'
            className={styles.button}>
              添加用户
          </Button>
        </Link> */}
        <DataTable
          scroll={{ x: 700 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
        {/* { visible ? <RoleModal {...this.props} id={this.id}/> : null } */}
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'adminUser/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    user: state.adminUser,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(User))

