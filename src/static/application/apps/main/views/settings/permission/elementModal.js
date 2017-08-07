import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Checkbox } from 'antd'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}

class ElementModal extends Component {
  hide = () => {
    this.props.dispatch({
      type: 'permission/hideModal'
    })
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
          type: 'permission/updateElement',
          payload: {
            id: this.props.permission.currentId,
            data: checkList
          }
        })
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, permission: { elementData, elementVisible, key, currentData } } = this.props
    return(
      <Modal
        title='配置元素'
        visible={elementVisible}
        onCancel={this.hide}
        onOk={this.handleSubmit}
        key={key}
       >
        <Form>
          <Row>
            {
              elementData.map((item, index) => {
                const ischeck = currentData.indexOf(item.id) > -1
                return(
                  <Col span={8} key={index}>
                    <FormItem
                      {...formItemLayout}
                      label={`${item.name}(${item.id})`}>
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
    )
  }
}
ElementModal = Form.create()(ElementModal)
export default ElementModal
