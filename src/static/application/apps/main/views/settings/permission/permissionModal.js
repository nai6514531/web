import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Checkbox } from 'antd'

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
            id: id
          }
        })
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, permission: { key, visible, record } } = this.props
    return(
      <Modal
        title="添加权限"
        visible={visible}
        onCancel={this.hide}
        onOk={this.handleSubmit}
        key={key}
       >
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label="权限名称"
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
