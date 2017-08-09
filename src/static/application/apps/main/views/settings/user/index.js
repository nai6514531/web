import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal, Form, Input, Checkbox, Col, Row } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'

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
    title: '用户设置'
  }
]
class User extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.hash)
    delete search.page
    delete search.per_page
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
        title: '运营商名称',
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
              <Link to={`/admin/settings/user/${record.id}`}>修改</Link> |
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
    const url = transformUrl(location.hash)
    this.props.dispatch({
      type: 'user/list',
      payload: {
        data: url
      }
    })
  }
  delete = (id) => {
    const url = transformUrl(location.hash)
    this.props.dispatch({
      type: 'user/delete',
      payload: {
        data: url,
        id: id
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'user/hideModal'
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
    location.hash = toQueryString({ ...this.search })
  }
  checkboxChange = (values) => {
    this.checkList = values
  }
  handleSubmit = () => {
    this.props.dispatch({
      type: 'user/updateRoles',
      payload: {
        id: this.id,
        data: this.checkList
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, user: { data: { objects, pagination }, roleData, currentRole, key, visible }, loading  } = this.props
    this.checkList = currentRole
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Input
          placeholder='请输入用户名搜索'
          style={{ width: 200, marginRight: 20 }}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.name}
         />
        <Input
          placeholder='请输入用户id搜索'
          style={{ width: 200, marginRight: 20 }}
          onChange={this.changeHandler.bind(this, 'id')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.id}
         />
        <Input
          placeholder='请输入账号搜索'
          style={{ width: 200, marginRight: 20 }}
          onChange={this.changeHandler.bind(this, 'account')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.account}
         />
        <Button
          type='primary'
          onClick={this.searchClick}
          style={{marginBottom: '20px', marginRight: 20}}
          >
          搜索
        </Button>
        <Button
          type='primary'
          style={{marginBottom: 20, marginRight: 20 }}>
            <Link
              to={`/admin/settings/user/new`}>
              添加用户
            </Link>
        </Button>
        <DataTable
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
        />
        <Modal
          title='配置角色'
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          key={key}
         >
          <Row>
            <Checkbox.Group onChange={this.checkboxChange} defaultValue={currentRole}>
            {
              roleData.map((item, index) => {
                return(
                  <Col span={8} key={index}>
                      <Checkbox value={item.id} >
                        {item.name}
                      </Checkbox>
                  </Col>
                )
              })
            }
            </Checkbox.Group>
          </Row>
        </Modal>
      </div>
    )
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

