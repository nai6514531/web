import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal, Form, Input, Checkbox, Col, Row } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl } from '../../../utils/'

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
    this.id = ''
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
              <Popconfirm title="确认删除?" onConfirm={ this.delete.bind(this,record.id) } >
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
  search = (type, value) => {
    location.hash = `&${type}=${value}`
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const checkList = []
        for(var key in values) {
          if(values[key]) {
            checkList.push(Number(key))
          }
        }
        this.props.dispatch({
          type: 'user/updateRoles',
          payload: {
            id: this.id,
            data: checkList
          }
        })
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, user: { data: { objects, pagination }, roleData, currentRole, key, visible }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Search
          placeholder="请输入用户名搜索"
          style={{ width: 200 }}
          onSearch={this.search.bind(this, 'name')}
         />
        <Search
          placeholder="请输入用户id搜索"
          style={{ width: 200, marginLeft: 20 }}
          onSearch={this.search.bind(this, 'id')}
         />
        <Search
          placeholder="请输入账号搜索"
          style={{ width: 200, marginLeft: 20 }}
          onSearch={this.search.bind(this, 'account')}
         />
        <Button
          type='primary'
          style={{marginBottom: 20, marginLeft: 20 }}>
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
          title="配置角色"
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          key={key}
         >
          <Form onSubmit={this.handleSubmit}>
            <Row>
              {
                roleData.map((item, index) => {
                  const ischeck = currentRole.indexOf(item.id) > -1
                  return(
                    <Col span={8} key={index}>
                      <FormItem
                        {...formItemLayout}
                        label={item.name}>
                        {getFieldDecorator(`${item.id}`,{
                           valuePropName: 'checked',
                           initialValue: ischeck,
                        })(
                          <Checkbox />
                        )}
                      </FormItem>
                    </Col>
                  )
                })
              }
            </Row>
          </Form>
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

