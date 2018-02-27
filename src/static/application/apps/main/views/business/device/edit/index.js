import React, { Component } from 'react'
import Promise from 'bluebird'
import _ from 'underscore'
import querystring from 'querystring'
import clone from 'clone'
import QRCode from 'qrcode.react'

import { Modal, Button, Form, Icon, Spin, Radio, Select, Input, Row, Col, message } from 'antd'
const { Group: RadioGroup } = Radio
const { Option } = Select
const { TextArea } = Input
const { Item: FormItem, create: createForm } = Form
const { confirm } = Modal

import DeviceService from '../../../../services/soda-manager/device'
import DeviceAddressService from '../../../../services/soda-manager/device-service-address'

import Mode from './mode'
import Breadcrumb from '../../../../components/layout/breadcrumb'

import styles from '../index.pcss'

const editBreadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '设备管理',
    url: '/business/device'
  },
  {
    title: '修改设备'
  }
]

const addBreadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '设备管理',
    url: '/business/device'
  },
  {
    title: '新增设备'
  }
]

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

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 4,
    },
  },
}

class Edit extends Component {
  constructor(props) {
    super(props)

    this.state = {
      device: {
        serial: '',
        serviceAddress: {
          id: 0,
          school: {
            id: 0,
            address: '',
            province: {
              id: 0
            }
          },
        },
        modes:[],
        feature: {
          type: 0
        }
      },
      deviceTypes: [],
      schools: [],
      serviceAddresses: [],
      loading: false,
      activeModal: '',
      activeSchoolId: 0,
      activeFeatureType: 0
    }
    this.isAdd = false
  }
  componentWillMount() {
    let path = this.props.location.pathname
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let { isAssigned } = query
    let { id } = this.props.match.params

    this.isAdd = !~path.indexOf('edit')
    this.isAssigned = isAssigned
    if (!this.isAdd) {
      this.getDeviceDetail(id) 
    }
    this.getDeviceServiceAddress()
    this.getDeviceType()
  }
  getDeviceDetail(id) {
    this.setState({ loading: true })
    DeviceService.detail(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data } = res
      let { serviceAddress: { school : { id: schoolId } } } = data
      this.setState({
        device: data,
        activeFeatureType: data.feature.type,
        activeSchoolId: schoolId,
        loading: false
      })
      return data.feature.type
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  // 获取设备服务地点
  getDeviceServiceAddress() {
    DeviceAddressService.list().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res
      let schools = _.chain(objects).groupBy((address) => {
        return address.school.id
      }).map((value, key) => {
        return {
          id: +key,
          name: value[0].school.name,
          objects: value
        }
      }).value()
      this.setState({
        schools: schools,
        serviceAddresses: objects
      })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  // 获取设备类型
  getDeviceType() {
    DeviceService.deviceType().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data } = res
      // 当前新增设备视图
      if (this.isAdd) {
        this.setState({
          deviceTypes: data,
          activeFeatureType: data[0].type
        })
        return
      }
      this.setState({ deviceTypes: data })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  handleSubmit() {
    let { form: { validateFields } } = this.props
    let { device: { modes }, loading, deviceTypes, activeFeatureType } = this.state
    let activeFeatureTypeMap = _.findWhere(deviceTypes, { type: activeFeatureType }) || {}
    let modesGroupByPulseId = _.indexBy(modes, (mode) => {
      return mode.pulse.id
    })

    let isAdd = this.isAdd

    validateFields((errors, value) => {
      if (errors || loading) {
        return
      }
      let serials = (value.serials || '').replace(/(^\s+)|(\s+$)/g, '')
      let options = {
        serials: serials.split(),
        serviceAddress: {
          id: parseInt(value.addressId, 10) || 0
        },
        feature: {
          type: value.featureType
        },
        modes: (activeFeatureTypeMap.pulse || []).map((pulse) => {
          let { id: pulseId } = pulse
          let isNew = _.isEmpty(modesGroupByPulseId[pulseId])
          let mode = {
            pulse: {
              id: pulseId,
              name: pulse.name,
            },
            name: value[`${activeFeatureType}-${pulseId}_NAME`],
            duration: +(+value[`${activeFeatureType}-${pulseId}_DURATION`] * 1000).toFixed(),
            value: +(+value[`${activeFeatureType}-${pulseId}_VALUE`] * 100).toFixed()
          }
          // 模式新增下
          if (!isNew) {
            mode = {
              ...mode,
              id: modesGroupByPulseId[pulseId].id
            } 
          }
          return mode
        })
      }

      if (isAdd) {
        return this.addDevice({...options, serials: serials.split('\n') })
      }
      this.updateDevice(options)
    })
  }
  addDevice(options) {
    this.setState({ loading: true })

    DeviceService.add(options).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({ loading: false })
      return this.props.history.go(-1)
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  updateDevice(options) {
    this.setState({ loading: true })

    DeviceService.update(options).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({ loading: false })
      return this.props.history.go(-1)
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  changeFeatureType(e) {
    let type = e.target.value
    this.setState({ activeFeatureType: type })
  }
  changeSchool(value) {
    let { form: { setFieldsValue } } = this.props
    setFieldsValue({ addressId: "" })
    this.setState({ activeSchoolId: value })
  }
  initialActiveModes() {
    let { activeFeatureType, deviceTypes, device: { feature: { type }, modes } } = this.state

    let activeFeatureTypeMap = _.findWhere(deviceTypes, { type: activeFeatureType }) || {}
    let modesGroupByPulseId = _.indexBy(modes, (mode) => {
      return mode.pulse.id
    })

    let activeModes = (activeFeatureTypeMap.pulse || []).map((pulse) => {
      let mode = modesGroupByPulseId[pulse.id]
      let isEmpty = _.isEmpty(mode) || activeFeatureType !== type
      return {
        id: activeFeatureType + '-' + pulse.id,
        pulse: {
          id: pulse.id,
          name: pulse.name,
        },
        name: isEmpty ? pulse.name : mode.name,
        duration: isEmpty ? 0 : mode.duration,
        value: isEmpty ? 0 : mode.value,
        status: isEmpty ? 'NEW' : mode.status,
      }
    })
    return activeModes
  }
  cancel() {
    confirm({
      title: `确定取消?`,
      onOk: () => {
        return this.props.history.go(-1)
      }
    })
  }
  render() {
    let { form: { getFieldDecorator } } = this.props
    let { 
      loading, serviceAddresses, activeModal, deviceTypes, activeFeatureType, activeSchoolId, schools,
      device: { id, serial, serviceAddress: { id : addressId, school: { id: schoolId } }, modes } 
    } = this.state
    let isAdd = this.isAdd
    // 当前选择学校下的服务地点
    let activeSchoolsMap = _.findWhere(schools, { id: activeSchoolId }) || {}
    let activeModes = this.initialActiveModes()

    return (<div>
      <Breadcrumb items={isAdd ? addBreadItems : editBreadItems} />
      <Spin spinning={loading}>
        <Form>
          { 
            isAdd ? <FormItem
              {...formItemLayout}
              label="设备编号" 
              extra="可直接复制 excel 表中设备编号列的数据来批量添加设备" >
              {getFieldDecorator('serials', {
                rules: [
                  {required: true, message: '必填'},
                ],
                initialValue: '',
              })(
                <TextArea rows={4}  placeholder="请输入一个或者多个10位设备编号，以回车分隔，每行一个编号" />
              )}
            </FormItem> :  <FormItem
            {...formItemLayout}
            label="设备编号"
            extra={<a onClick={() => { this.setState({ activeModal: 'QRCode'})}}>查看设备二维码</a>}>
            {getFieldDecorator('serials', {
              rules: [
                {required: true, message: '必填'},
                {max:30, message: '不超过三十个字' },
              ],
              initialValue: serial,
            })(
              <Input disabled placeholder="请输入设备编号" />
            )}
          </FormItem>
          }
          <FormItem
            {...formItemLayout}
            label="服务地点">
            {getFieldDecorator('schoolId', {
              rules: [
                {required: true, message: '必填'},
              ],
              initialValue: activeSchoolId === 0 ? '' : activeSchoolId
            })(
              <Select
                showSearch
                placeholder="请选择学校"
                optionFilterProp="children"
                onChange={this.changeSchool.bind(this)}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                <Option value="">请选择学校</Option>
                {(schools || []).map((school) => {
                  return <Option key={school.id} value={school.id}>{school.name}</Option>
                })}
              </Select> 
            )}
          </FormItem>
          <FormItem
            {...tailFormItemLayout}
            label="">
            <Row>
              <Col xs={24} sm={19}>
              {getFieldDecorator('addressId', {
                rules: [
                  {required: true, message: '必填'},
                ],
                initialValue: addressId ? String(addressId) : ''
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="请选择服务地点"
                  notFoundContent="搜索无结果">
                    <Option value="">请选择服务地点</Option>
                    { 
                      (activeSchoolsMap.objects || []).map((address) => {
                        return <Option key={address.id} value={String(address.id)}>{address.school.address}</Option>
                      })
                    }
                </Select>
              )}
              </Col>
              <Col xs={24} sm={{ span: 4, offset: 1 }}>
                <Button 
                  type='primary'
                  className={styles.addressButton}
                  onClick={() => { this.props.history.push(`/business/device/address?isFromEditView=true&id=${id}&isAssigned=${this.isAssigned}`)}}>地点管理</Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="关联设备类型">
            {getFieldDecorator('featureType', {
              rules: [
                { required: true, message: '必填' },
              ],
              initialValue: activeFeatureType
            })(
              <RadioGroup onChange={this.changeFeatureType.bind(this)} >
                {
                  (deviceTypes || []).map((item) => {
                    return <Radio key={item.type} value={item.type}>{item.name}</Radio>
                  })
                }
              </RadioGroup>
            )}
          </FormItem>
          { 
            !_.isEmpty(activeModes) ? (activeModes || []).map((mode, index) => {
              return <Mode 
              mode={mode} 
              index={index+1}
              key={mode.id}
              form={this.props.form} />
            }) : null
          }
          <FormItem {...tailFormItemLayout}>
            <Button style={{ marginRight: 10 }} type="ghost" onClick={this.cancel.bind(this)}>取消</Button>
            <Button type="primary" onClick={this.handleSubmit.bind(this)}>保存</Button>
          </FormItem>
        </Form>
      </Spin>
      <Modal
        wrapClassName={styles.qrModal}
        closable={false}
        visible={activeModal === 'QRCode'}
        onCancel={() => { this.setState({ activeModal: '' })}}
        footer={null}>
        <QRCode value={serial} />
      </Modal>
    </div>)
  }
}

export default createForm()(Edit)