import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Radio, Popover, Button } from 'antd'
import { transformUrl, toQueryString } from '../../../utils/'
import { difference } from 'lodash'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}

class RoleModal extends Component {
  constructor(props) {
    super(props)
    this.checkedList = this.props.user.currentRole.map(value => value.roleId)
  }
  hide = () => {
    this.props.dispatch({
      type: 'user/hideModal'
    })
  }
  handleSubmit = () => {
    const defaultCheckedList = this.props.user.currentRole.map(value => value.roleId)
    const userId = Number(this.props.id)
    const url = transformUrl(location.search)
    const deleteList = []
    difference(defaultCheckedList,this.checkedList).map(roleId => {
      return  this.props.user.currentRole.map(item => {
        if(roleId == item.roleId) {
          deleteList.push(item.id)
        }
      })
    })
    const createList = difference(this.checkedList,defaultCheckedList).map(roleId => {
      return {
        userId,
        roleId
      }
    })
    this.props.dispatch({
      type: 'user/updateRoles',
      payload: {
        data: {
          delete: deleteList,
          create: createList,
          url
        }
      }
    })
  }
  changeHandler = (e) => {
    this.checkedList = [e.target.value]
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

          <Radio.Group onChange={this.changeHandler} defaultValue={this.checkedList[0]}>
          {/* 默认单选 */}
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
