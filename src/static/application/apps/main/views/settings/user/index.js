import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal, Form, Input, Checkbox, Col, Row, Select } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import PasswordModal from './passwordModal.js'
import styles from '../../../assets/css/search-bar.pcss'

const Search = Input.Search
const FormItem = Form.Item
const Option = Select.Option
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}
const breadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '账号管理'
  },
  {
    title: '员工账号'
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
        title: '员工姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '登录账号',
        dataIndex: 'account',
        key: 'account',
      },
      {
        title: '联系手机号',
        dataIndex: 'mobile',
        key: 'mobile',
      },
      {
        title: '角色',
        render: (text, record, index) => {
         return (
          record.role[0] && record.role[0].name //只支持单角色
         )
       }
      },
      // {
      //   title: '状态',
      //  render: (text, record, index) => {
      //    return (
      //     record.status === 0 ? '正常' : '已拉黑'
      //    )
      //  }
      // },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record.id) }>{'\u00A0'}修改密码</a> |
              <Link to={`/admin/settings/user/${record.id}`}>{'\u00A0'}修改信息</Link>
              <Popconfirm title='确定要删除该账号?' onConfirm={ this.delete.bind(this,record.id) } >
                    | <a href='javascript:void(0)'>{'\u00A0'}删除账号</a>
              </Popconfirm>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = transformUrl(location.search)
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
      type: 'user/list',
      payload: {
        data: params
      }
    })
  }
  fetchRole = (params) => {
    this.props.dispatch({
      type: 'user/roles'
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
      type: 'user/showModal'
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
   this.fetch(url)
  }
  render() {
    const { form: { getFieldDecorator }, common: { search }, user: { data: { objects, pagination }, key, visible, roleData }, loading  } = this.props
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
        {/* <Input
          placeholder='请输入用户id搜索'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'id')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.id}
         /> */}
        <Input
          placeholder='请输入账号搜索'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'account')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.account}
         />
         <Select
          value={ search.roleId }
          allowClear
          className={styles.input}
          placeholder='请选择角色搜索'
          onChange={this.selectHandler.bind('this','roleId')}>
            {
              roleData.map(value => {
                return (
                  <Option value={value.id + ''} key={value.id}>{value.name}</Option>
                )
              })
            }
        </Select>
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
    this.props.dispatch({ type: 'user/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    user: state.user,
    common: state.common,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(User))

