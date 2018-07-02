import React, { Component } from 'react'
import _ from 'underscore'
import { Modal, message, Button, Form, Icon, Spin, Radio, Select, Input, Row, Col } from 'antd'
const { Group: RadioGroup } = Radio
const { Option } = Select
const { TextArea } = Input
const { Item: FormItem, create: createForm } = Form
const { confirm } = Modal

import { conversionUnit } from '../../../../../utils/functions'
import DeviceService from '../../../../../services/soda-manager/device'
import DEVICE from '../../../../../constant/device'

import styles from '../index.pcss'

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
}

class Mode extends Component {
  constructor(props) {
    super(props)
    let { mode } = this.props

    this.state = {
      loading: false,
      mode: mode
    }
  }
  componentDidMount() {
    let { mode: { id }, form: { resetFields } } = this.props
    // 切换类型 reset表单的内容
    resetFields([`${id}_NAME`, `${id}_VALUE`, `${id}_DURATION`])
  }
  render() {
    let { form: { getFieldDecorator } } = this.props
    let { mode: { id, name, duration, value, status }, activeReferenceId, featureId, referenceId, index } = this.props
    let label = "服务程序" + (index)

    return (<Row className={styles.editMode}>
      <Col xs={24} sm={4}><span className={styles.label}>{label}</span></Col>
      <Col xs={24} sm={16}>
        <Row>
          <Col xs={24} sm={12}>
            <FormItem
            className={styles.formItem}
            style= {{ marginRight: 5 }}>
              {getFieldDecorator(`${id}_NAME`, {
                rules: [
                  { required: true, message: '必填' },
                  { max: 20, message: '不超过二十个字' },
                ],
                initialValue: name,
              })(
                <Input
                addonBefore="名称"
                placeholder="设备名" />
              )}
            </FormItem>
          </Col>
          <Col xs={24} sm={6}>
            <FormItem 
            className={styles.formItem}
            style= {{ marginRight: 5 }}>
              {getFieldDecorator(`${id}_VALUE`, {
                rules: [
                  { required: true, message: '必填' },
                  { type: 'string', pattern: /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/, message: '请输入正确价格'},
                  (rule, value, callback, source, options) => {
                    if (value > 20) {
                      callback('价格最大不能超过20元')
                      return false
                    }
                    callback()
                    return true
                  }
                ],
                initialValue: activeReferenceId === referenceId ? conversionUnit(value) : conversionUnit(index * 100),
              })(
                <Input 
                prefix={<Icon type="pay-circle-o" style={{ color: 'rgba(0,0,0,.25)' }} />}
                addonAfter={featureId === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER ? '元/L' : '元'}
                placeholder="价格(元)"  />
              )}
            </FormItem>
          </Col>
          { 
            true ? null : <Col xs={24} sm={6}>
            <FormItem 
            className={styles.formItem}
            style= {{ marginRight: 5 }}>
              {getFieldDecorator(`${id}_DURATION`, {
                rules: [
                  { required: true, message: '必填' },
                  { type: 'string', pattern: /^(0|[1-9][0-9]*)$/, message: '请输入正确时间'},
                ],
                initialValue: duration ? String((duration / 60).toFixed()) : "0",
              })(
                <Input 
                prefix={<Icon type="clock-circle-o" style={{ color: 'rgba(0,0,0,.25)' }} />}
                addonAfter='分钟'
                placeholder="时间(分钟)" />
              )}
            </FormItem>
          </Col>
        }
        </Row>
      </Col>
     </Row>)
  }
}

export default Mode
