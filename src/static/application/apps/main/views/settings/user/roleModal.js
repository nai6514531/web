import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Checkbox, Popover, Button } from 'antd'
import { transformUrl, toQueryString } from '../../../utils/'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}

class RoleModal extends Component {
  constructor(props) {
    super(props)
    this.checkList = this.props.user.currentRole
  }
  hide = () => {
    this.props.dispatch({
      type: 'user/hideModal'
    })
  }
  handleSubmit = () => {
    this.props.dispatch({
      type: 'user/updateRoles',
      payload: {
        id: this.props.id,
        data: this.checkList
      }
    })
  }
  checkboxChange = (values) => {
    this.checkList = values
  }
  render() {
    const { form: { getFieldDecorator }, user: { data: { objects, pagination }, roleData, currentRole, key, visible }, loading  } = this.props
    return(
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
    )
  }
}
RoleModal = Form.create()(RoleModal)
export default RoleModal
