import React, { Component } from 'react'
import { render } from 'react-dom'
import { Form, Modal, Input, Row, Col, Checkbox, Popover, Button } from 'antd'
import { transformUrl, toQueryString } from '../../../utils/'

const FormItem = Form.Item
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}

class ActionModal extends Component {
  constructor(props) {
    super(props)
    this.search = {
      noPagination: true
    }
    this.checkList = this.props.permission.currentData
  }
  hide = () => {
    this.checkList = []
    this.search = {noPagination: true}
    this.props.dispatch({
      type: 'permission/hideModal'
    })
  }
  handleSubmit = () => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'permission/updateAction',
      payload: {
        id: this.props.permission.currentId,
        data: this.checkList,
        url: url
      }
    })
  }
  changeHandler =  (type, e) => {
    this.search = { ...this.search, [type]: e.target.value }
  }
  searchClick = () => {
    this.props.dispatch({
      type: 'permission/searchAction',
      payload: {
        data: this.search
      }
    })
  }
  onChange = (values) => {
    this.checkList = values
  }
  render() {
    const { form: { getFieldDecorator }, permission: { actionData, actionVisible, key, currentData }, loading } = this.props
    return(
      <Modal
        title='配置接口'
        visible={actionVisible}
        onCancel={this.hide}
        onOk={this.handleSubmit}
        style={{height:300}}
        key={key}
        width={700}
       >
        <Row>
          <Input
            placeholder='请输入控制器名称关键字'
            style={{ width: 200, marginRight: 20, marginTop: 10 }}
            onChange={this.changeHandler.bind(this, 'handlerName')}
            onPressEnter={this.searchClick}
           />
          <Input
            placeholder='请输入请求方法关键字'
            style={{ width: 200, marginRight: 20, marginTop: 10 }}
            onChange={this.changeHandler.bind(this, 'method')}
            onPressEnter={this.searchClick}
           />
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            loading={loading}
            >
            搜索
          </Button>
          <Checkbox.Group onChange={this.onChange} defaultValue={currentData}>
          {
            actionData.map((item, index) => {
              return(
                <Col span={8} key={index}>
                    <Checkbox value={item.id} >
                      <Popover
                        content={
                          <Row>
                            <Row style={{marginTop:10}}><Col span={5}>控制器名称:</Col><Col span={19}>{item.handlerName}</Col></Row>
                            <Row style={{marginTop:10}}><Col span={5}>api:</Col>{item.api}</Row>
                            <Row style={{marginTop:10}}><Col span={5}>请求方法:</Col>{item.method}</Row>
                            <Row style={{marginTop:10}}><Col span={5}>描述:</Col>{item.description}</Row>
                          </Row>
                        }>
                        {item.description}
                      </Popover>
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
ActionModal = Form.create()(ActionModal)
export default ActionModal
