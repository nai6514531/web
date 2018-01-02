import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Checkbox } from 'antd'
import { transformUrl, toQueryString } from '../../../utils/'

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

class PermissionModal extends Component {
  hide = () => {
    this.props.dispatch({
      type: 'permission/hideModal'
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    const url = transformUrl(location.search)
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.permission.record.id
        let type = 'permission/add'
        if(id) {
          type = 'permission/update'
        }
        this.props.dispatch({
          type: type,
          payload: {
            data: values,
            id: id,
            url: url
          }
        })
      }
    })
  }
  reset = () => {
    const { resetFields, getFieldsValue } = this.props.form
    resetFields(Object.keys(getFieldsValue()))
  }
  render() {
    const { form: { getFieldDecorator }, permission: { key, visible, record } } = this.props
    const title = record.id ? '编辑权限' : '添加权限'
    return(
      <Modal
        title={title}
        visible={visible}
        onCancel={this.hide}
        onOk={this.handleSubmit}
        afterClose={this.reset}
       >
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label='权限名称'
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入权限名称!',
              }],
              initialValue: record.name
            })(
              <Input />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
PermissionModal = Form.create()(PermissionModal)
export default PermissionModal
