import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal, Form, Input, Checkbox, Col, Row, Select, TreeSelect } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import PasswordModal from './passwordModal.js'
import styles from '../../../../assets/css/search-bar.pcss'

const Search = Input.Search
const FormItem = Form.Item
const Option = Select.Option
const TreeNode = TreeSelect.TreeNode
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
          record.role && record.role.name //只支持单角色
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
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record.id) }>{'\u00A0'}修改密码</a> |
              <Link to={`/admin/settings/user/${record.id}`}>{'\u00A0'}修改信息{'\u00A0'}</Link>
              {
                record.status === 0
                ? <Popconfirm title='确定要拉黑该账号?' onConfirm={ this.changeStatus.bind(this,record.id, 1) } >
                      | <a href='javascript:void(0)'>{'\u00A0'}拉黑账号</a>
                  </Popconfirm>
                : <Popconfirm title='确定要恢复该账号?' onConfirm={ this.changeStatus.bind(this,record.id, 0) } >
                        | <a href='javascript:void(0)'>{'\u00A0'}恢复账号</a>
                  </Popconfirm>
              }
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    if( !url.roleId ) {
      delete url.roleId
    }
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.fetch(url)
    this.fetchRole()
  }
  fetch = (params) => {
    this.props.dispatch({
      type: 'adminUser/list',
      payload: {
        data: params
      }
    })
  }
  fetchRole = (params) => {
    this.props.dispatch({
      type: 'adminUser/roles'
    })
  }
  changeStatus = (id, status) => {
    this.props.dispatch({
      type: 'adminUser/changeStatus',
      payload: {
        data: this.search,
        id: id,
        status
      }
    })
  }
  show = (id) => {
    this.id = id
    this.props.dispatch({
      type: 'adminUser/showModal'
    })
  }
  changeHandler =  (type, e) => {
    this.search = { ...this.search, [type]: e.target.value }
  }
  selectHandler =  (type, value) => {
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: {
          [type]: value
        }
      }
    })
    if(!value) {
      value = ''
    }
    this.search = { ...this.search, [type]: value }
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
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  render() {
    let { form: { getFieldDecorator }, common: { search }, adminUser: { data: { objects, pagination }, key, visible, roleTree }, loading, location: { pathname } } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} location={this.props.location} />
        <Input
          placeholder='请输入用户名搜索'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.name}
         />
        <Input
          placeholder='请输入登录账号搜索'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'account')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.account}
         />
        <TreeSelect
          allowClear
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          value={search.roleId}
          className={styles.input}
          treeData={roleTree}
          placeholder="请选择角色搜索"
          treeDefaultExpandAll
          onChange={this.selectHandler.bind('this','roleId')}
        />
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          >
          搜索
        </Button>
        <Link
          to={`/admin/settings/user/new`}>
          <Button
            type='primary'
            className={styles.button}>
              新增账号
          </Button>
        </Link>
        <DataTable
          scroll={{ x: 700 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
        <PasswordModal {...this.props} id={this.id}/>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'adminUser/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    adminUser: state.adminUser,
    common: state.common,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(User))

