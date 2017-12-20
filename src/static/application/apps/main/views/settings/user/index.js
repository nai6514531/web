import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal, Form, Input, Checkbox, Col, Row } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import RoleModal from './roleModal.js'
import styles from './index.pcss'

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
    this.search = search
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
        title: '地址',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/admin/settings/user/${record.id}`}>编辑</Link> |
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除</a> |
              </Popconfirm>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record.id) }>{'\u00A0'}配置角色</a>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = transformUrl(location.search)
    this.fetch(url)
  }
  fetch = (params) => {
    this.props.dispatch({
      type: 'user/list',
      payload: {
        data: params
      }
    })
  }
  delete = (id) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'user/delete',
      payload: {
        data: url,
        id: id
      }
    })
  }
  show = (id) => {
    this.id = id
    this.props.dispatch({
      type: 'user/roles',
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
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            搜索
          </Button>
          <Link
            to={`/admin/settings/user/new`}>
            <Button
              type='primary'
              style={{marginBottom: 20, marginRight: 20 }}>
                添加用户
            </Button>
          </Link>
        </span>
        <DataTable
          scroll={{ x: 700 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
        { visible ? <RoleModal {...this.props} id={this.id}/> : null }
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'user/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    user: state.user,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(User))

