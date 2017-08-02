import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal, Form, Input, Checkbox, Col, Row } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl } from '../../../utils/'

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
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>{'\u00A0'}配置角色</a>
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
  show = (record) => {
    this.props.dispatch({
      type: 'user/showModal',
      payload: {
        data: record
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        console.log('values',values)
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, user: { data: { objects, pagination }, roleData, key, visible }, loading  } = this.props
    //todo
    const record = {}
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          style={{marginBottom: '20px'}}>
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
                  return(
                    <Col span={8} key={index}>
                      <FormItem
                        {...formItemLayout}
                        label={item.name}>
                        {getFieldDecorator(`${item.id}`)(
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

