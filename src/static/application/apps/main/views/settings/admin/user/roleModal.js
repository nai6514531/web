import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Radio, Popover, Button } from 'antd'
import { transformUrl, toQueryString } from '../../../../utils/'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}

class RoleModal extends Component {
  constructor(props) {
    super(props)
    this.checkList = [this.props.user.currentRole]
  }
  hide = () => {
    this.props.dispatch({
      type: 'adminUser/hideModal'
    })
  }
  handleSubmit = () => {
    this.props.dispatch({
      type: 'adminUser/updateRoles',
      payload: {
        id: this.props.id,
        data: this.checkList
      }
    })
  }
  changeHandler = (e) => {
    this.checkList = [e.target.value]
  }
  reset = () => {
    const { resetFields, getFieldsValue } = this.props.form
    resetFields(Object.keys(getFieldsValue()))
  }
  render() {
    const { form: { getFieldDecorator }, user: { data: { objects, pagination }, roleData, currentRole, key, visible }, loading  } = this.props
    return(
      <Modal
        title='配置角色'
        visible={visible}
        onCancel={this.hide}
        onOk={this.handleSubmit}
        afterClose={this.reset}
       >

          <Radio.Group onChange={this.changeHandler} defaultValue={currentRole}>

          {
            roleData.map((item, index) => {
              return(
                <Radio value={item.id} style={{ minWidth: '130px', margin: '0 10px' }} key={index}>
                  {item.name}
                </Radio>
              )
            })
          }

          </Radio.Group>

      </Modal>
    )
  }
}
RoleModal = Form.create()(RoleModal)
export default RoleModal
