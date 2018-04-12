import React, { Component } from 'react'
import Promise from 'bluebird'
import _ from 'underscore'
import op from 'object-path'
import querystring from 'querystring'
import clone from 'clone'
import QRCode from 'qrcode.react'

import { Modal, Button, Form, Icon, Spin, Radio, Select, Input, Row, Col, message } from 'antd'
const { Group: RadioGroup } = Radio
const { Option } = Select
const { TextArea } = Input
const { Item: FormItem, create: createForm } = Form
const { confirm } = Modal

import DeviceService from '../../../../../services/soda-manager/device'
import DeviceAddressService from '../../../../../services/soda-manager/device-service-address'

import Mode from './mode'
import Breadcrumb from '../../../../../components/layout/breadcrumb'

import styles from '../index.pcss'

const editBreadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '设备管理',
    url: '/soda/business/device'
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
    url: '/soda/business/device'
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
      activeAddressId: 0,
      activeSchoolId: '',
      activeFeatureType: 0
    }
    this.isAdd = false
  }
  componentWillMount() {
    let path = this.props.location.pathname
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let { isAssigned } = query
    let { serial } = this.props.match.params

    this.isAdd = !~path.indexOf('edit')
    this.isAssigned = isAssigned === 'true' || false
    if (!this.isAdd) {
      this.getDeviceDetail(serial)
    } else {
      this.getDeviceServiceAddress()
    }
    this.getDeviceType()
  }
  getDeviceDetail(serial) {
    this.setState({ loading: true })
    DeviceService.detail(serial).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: device } = res
      this.getDeviceServiceAddress(device.user.id)
      this.getDeviceModes(device) 
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getDeviceModes(device) {
    this.setState({ loading: true })
    DeviceService.deviceModeList({ serials: device.serial }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res
      this.setState({
        device: { ...device,  modes: objects },
        activeAddressId: device.serviceAddress.id,
        activeFeatureType: device.feature.type,
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  // 获取设备服务地点
  getDeviceServiceAddress(userId) {
    DeviceAddressService.list({ userId: userId}).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res
      let schools = [], addresses = {}
      _.chain(objects).reject((address) => {
        // 过滤地址为空 或 学校无校名
        return address.school.address === '' || (address.school.name === '' && address.school.id !== 0)
      }).groupBy((address) => {
        return address.school.id
      }).each((value, key) => {
        if (value[0].school.id === 0) {
          addresses = {
            id: +key,
            name: '其他',
            objects: value
          }
        } else {
           schools = [ ...schools, {
            id: +key,
            name: value[0].school.name,
            objects: value
          }]
        }
      })
      this.setState({
        schools: _.isEmpty(addresses) ? schools : [...schools, addresses],
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
    let modesGroupByPulseId = _.indexBy(modes || [], (mode) => {
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
            duration: +(+value[`${activeFeatureType}-${pulseId}_DURATION`] * 60).toFixed(),
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
        let isInvalid = false
        _.chain(serials.split('\n')).map((serial) => String(serial)).groupBy((serial) => serial.length ).keys().each((value) => {
          if (+value < 5) {
            isInvalid = true
          }
        })
        if (isInvalid) {
          return message.error('请输入正确的设备编号')
        }
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
    console.log('changeSchool', value)
    this.setState({ activeSchoolId: value })
  }
  changeAddress(value) {
    this.setState({ activeAddressId: value })
  }
  initialActiveModes() {
    let { activeFeatureType, deviceTypes, device: { feature: { type }, modes } } = this.state

    let activeFeatureTypeMap = _.findWhere(deviceTypes, { type: activeFeatureType }) || {}
    let modesGroupByPulseId = _.indexBy(modes || [], (mode) => {
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
      loading, serviceAddresses, activeModal, deviceTypes, activeFeatureType, activeAddressId, activeSchoolId, schools,
      device: { id, serial } 
    } = this.state
    let isAdd = this.isAdd
    // 当前选择学校下的服务地点
    let activeAddress = _.findWhere(serviceAddresses, { id: activeAddressId }) || {}
    activeSchoolId = activeSchoolId === '' ? op(activeAddress).get('school.id') : activeSchoolId
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
              initialValue: activeSchoolId
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
              <Col xs={24} sm={this.isAssigned ? 24 : 19}>
              {getFieldDecorator('addressId', {
                rules: [
                  {required: true, message: '必填'},
                ],
                initialValue:_.isEmpty(activeSchoolsMap.objects) ? '' : activeAddressId
              })(
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="请选择服务地点"
                  onChange={this.changeAddress.bind(this)}
                  notFoundContent="搜索无结果">
                    <Option value="">请选择服务地点</Option>
                    { 
                      (activeSchoolsMap.objects || []).map((address) => {
                        return <Option key={address.id} value={address.id}>{address.school.address}</Option>
                      })
                    }
                </Select>
              )}
              </Col>
              { 
                !this.isAssigned ? <Col xs={24} sm={{ span: 4, offset: 1 }}>
                  <Button 
                    type='primary'
                    className={styles.addressButton}
                    onClick={() => { this.props.history.push(`/soda/business/device/address?fromDevice=true&id=${id}&isAssigned=${this.isAssigned}`)}}>地点管理</Button>
                </Col> : null
              }
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