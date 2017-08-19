import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Checkbox } from 'antd'
import { transformUrl, toQueryString } from '../../../utils/'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}

class ElementModal extends Component {
  constructor(props) {
    super(props)
    this.checkList = []
  }
  hide = () => {
    this.props.dispatch({
      type: 'permission/hideModal'
    })
  }
  onChange = (values) => {
    this.checkList = values
  }
  handleSubmit = () => {
    const url = transformUrl(location.hash)
    this.props.dispatch({
      type: 'permission/updateElement',
      payload: {
        id: this.props.permission.currentId,
        data: this.checkList,
        url: url
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, permission: { elementData, elementVisible, key, currentData } } = this.props
    this.checkList = currentData
    return(
      <Modal
        title='配置元素'
        visible={elementVisible}
        onCancel={this.hide}
        onOk={this.handleSubmit}
        key={key}
       >
        <Checkbox.Group onChange={this.onChange} defaultValue={currentData}>
          <Row>
            {
              elementData.map((item, index) => {
                return(
                  <Col span={8} key={index}>
                      <Checkbox value={item.id} >
                        {item.name}
                      </Checkbox>
                  </Col>
                )
              })
            }
          </Row>
        </Checkbox.Group>
      </Modal>
    )
  }
}
ElementModal = Form.create()(ElementModal)
export default ElementModal
