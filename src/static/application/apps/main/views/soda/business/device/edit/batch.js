import React, { Component } from 'react'
import _ from 'underscore'
import op from 'object-path'
import querystring from 'querystring'
import { Checkbox, Modal, Button, Form, Icon, Spin, Radio, Select, Input, Row, Col, message } from 'antd'
const { Item: FormItem, create: createForm } = Form
const { Option } = Select
const { Group: RadioGroup } = Radio
const { confirm } = Modal

import Breadcrumb from '../../../../../components/layout/breadcrumb'
import BatchTable from './batch-table'

import DeviceService from '../../../../../services/soda-manager/device'
import DeviceAddressService from '../../../../../services/soda-manager/device-service-address'
import { conversionUnit } from '../../../../../utils/functions'

import styles from '../index.pcss'

const breadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '设备管理',
    url: '/soda/business/device'
  },
  {
    title: '批量修改'
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

class BatchMode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: {
        address: false,
        feature: false,
        price: false,
        name: false,
        duration: false,
      },
      preview: {
        address: false,
        feature: false,
        featureType: '',
        price: false,
        name: false,
        duration: false,
      },
      schools: {},
      serviceAddresses: [],
      activeSchoolId: '',
      activeFeatureType: 0,
      deviceTypes: [],
      devices: [],
      count: 0,
      loading: false
    }
    this.isAssigned = false,
    this.devices = [],
    this.serials = ""
  }
  componentWillMount() {
    let path = this.props.location.pathname
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let data = _.pick(query, 'serials', 'isAssigned')

    this.isAssigned = data.isAssigned === 'true' || false
    this.serials = data.serials
    
    this.getDevices(this.serials)
    this.getDeviceType()
    this.getDeviceServiceAddress()
  }
  getDevices(serials) {
    let isAssigned = this.isAssigned
    this.setState({ loading: true })
    
    DeviceService.list({ 
      serials: serials, 
      isAssigned: isAssigned ? 1 : 0,
      offset: 0,
      limit: serials.split(',').length,
      isEqual: true
    }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res

      this.getDevicesModes(objects, serials)
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getDevicesModes(devices, serials) {
    let isAssigned = this.isAssigned
    this.setState({ loading: true })
    
    DeviceService.deviceModeList({ 
      serials: serials
    }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res
      devices = (devices || []).map((device) => {
        let modes = _.filter(objects, (mode) => { return mode.serial === device.serial})
        return { ...device, modes }
      })
      this.setState({
        devices: devices,
        featureType: op(devices[0]).get('feature.type'),
        activeFeatureType: op(devices[0]).get('feature.type'),
        loading: false
      })
      this.devices = devices || []
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  // 获取设备服务地点
  getDeviceServiceAddress() {
    let { serviceAddresses } = this.state
    if (!_.isEmpty(serviceAddresses) || this.isAssigned) {
      return
    }
    DeviceAddressService.list().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res
      let schools = [], addresses
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
    })
  }
  // 获取设备类型
  getDeviceType() {
    DeviceService.deviceType().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data } = res
      this.setState({ deviceTypes: data })
    })
  }
  toggleCheckbox(key, e) {
    let { form: { setFieldsValue, resetFields } } = this.props
    let { active, featureType, activeFeatureType, deviceTypes } = this.state
    let { price: activePrice, name: activeName, duration: activeDuration } = active
    let activeFeatureTypeMap = _.findWhere(deviceTypes, { type: activeFeatureType }) || {} 
    let value = e.target.checked
    this.setState({ active: {
      ...active,
      [`${key}`]: value
    }})

    // 选择地点选项，学校信息默认值，避免再次渲染初始值为之前选项
    if (key === 'address' && value) {
      this.getDeviceServiceAddress()
      setTimeout(() => {
        setFieldsValue({ schoolId: "", addressId: "" })
      }, 0)
    }
    if (key === 'feature' && value) {
      setTimeout(() => {
        setFieldsValue({ featureType: featureType })
      }, 0)
    }
    // 取消设备类型选项，重置表单信息，避免再次渲染初始值为之前选项    
    if (key === 'feature' && !value) {
      if (featureType !== activeFeatureType) {
        setTimeout(() => {
          (activeFeatureTypeMap.pulse || []).map((pulse, index) => {          
            activeName ? resetFields([`name-${index}`]) : null
            activePrice? resetFields([`price-${index}`]) : null
            activeDuration? resetFields([`duration-${index}`]) : null
          })
        }, 0)
      }
      this.setState({ activeFeatureType: featureType })
    }
    // 选择服务名称、价格、时间选项，重置表单信息，避免再次渲染初始值为之前选项
    if (!!~['name', 'price', 'duration'].indexOf(key) && value) {
      // 切换类型 reset表单的内容
      setTimeout(() => {      
        (activeFeatureTypeMap.pulse || []).map((pulse, index) => {
          resetFields([`${key}-${index}`])
        })
      }, 0)
    }
  }
  handleSubmit() {
    let { form: { validateFields } } = this.props
    let { loading } = this.state

    validateFields((errors, value) => {
      if (errors || loading) {
        return
      }
      confirm({
        title: `确认要修改?`,
        onOk: () => {
          return this.toEdit()
        }
      })
    })
    
  }
  toEdit() {
    let { form: { validateFields } } = this.props
    let { deviceTypes, activeFeatureType, featureType } = this.state
    let activeFeatureTypeMap = _.findWhere(deviceTypes, { type: activeFeatureType }) || {}
    let isChangeFeatureType = activeFeatureType !== featureType
    let { 
      active: { address: activeAddress, feature: activeFeature, price: activePrice, name: activeName, duration: activeDuration }, 
      serviceAddresses, loading 
    } = this.state
    let serials = this.serials.split(',')

    validateFields((errors, value) => {
      let options = {}
      if (errors || loading) {
        return
      }
      
      if (activeAddress) {
        let addressId = parseInt(value.addressId, 10) || 0
        options = {
          ...options,
          serviceAddress: {
            id: addressId
          }
        }
      }
      if (activeFeature) {
        options = {
          ...options,
          feature: {
            type: value.featureType
          }
        }
      }
      
      let devices = (this.devices || []).map((device) => {
        let modesArray = _.groupBy(device.modes, (mode) => { return mode.pulse.id })
        if (activeFeature || activeName || activePrice || activeDuration) {
          return {
            ..._.pick(device, 'serial'),
            ...options,
            modes: (activeFeatureTypeMap.pulse || []).map((pulse, index) => {
              let mode = _.isEmpty(modesArray[pulse.id]) ? {} : modesArray[pulse.id][0]
              return {
                pulse: {
                  id: pulse.id,
                  name: pulse.name
                },
                name: activeName ? value[`name-${index}`] : 
                  isChangeFeatureType || _.isEmpty(mode) ? pulse.name : mode.name,
                value: activePrice ? +value[`price-${index}`] * 100 : 
                isChangeFeatureType || _.isEmpty(mode) ? 0 : mode.value,
                duration: activeDuration ? +(+value[`duration-${index}`] * 60).toFixed() :  
                isChangeFeatureType || _.isEmpty(mode) ? 0 : mode.duration,
              }
            })
          }
        } else {
          return {
            ..._.pick(device, 'serial'),
            ...options,
          }
        }
        
      })
      this.updateDevice(devices)
    })
  }
  toPreview() {
    let { form: { validateFields } } = this.props
    let { deviceTypes, activeFeatureType, featureType } = this.state
    let activeFeatureTypeMap = _.findWhere(deviceTypes, { type: activeFeatureType }) || {}
    let isChangeFeatureType = activeFeatureType !== featureType
    let { 
      active: { address: activeAddress, feature: activeFeature, price: activePrice, name: activeName, duration: activeDuration }, 
      serviceAddresses, loading 
    } = this.state

    validateFields((errors, value) => {
      let options = {}
      if (errors || loading) {
        return
      }

      if (!activeAddress && !activeFeature && !activeAddress && !activePrice && !activeName && !activeDuration) {
        return this.setState({ devices: this.devices, preview: { address: false, feature: false, price: false, name: false, featureType: featureType } })
      }
      
      if (activeAddress) {
        let addressId = parseInt(value.addressId, 10) || 0
        let serviceAddress = _.findWhere(serviceAddresses, { id: addressId }) || {}
        options = {
          ...options,
         serviceAddress
        }
      }
      if (activeFeature) {
        options = {
          ...options,
          feature: {
            type: value.featureType,
            name: activeFeatureTypeMap.name
          }
        }
      }

      let devices = (this.devices || []).map((device) => {
        let modesArray = _.groupBy(device.modes, (mode) => { return mode.pulse.id })
        return {
          ...device,
          ...options,
          modes: (activeFeatureTypeMap.pulse || []).map((pulse, index) => {
            let mode = _.isEmpty(modesArray[pulse.id]) ? {} : modesArray[pulse.id][0]
            return {
              pulse: {
                id: pulse.id,
                name: pulse.name
              },
              name: activeName ? value[`name-${index}`] : 
                isChangeFeatureType || _.isEmpty(mode) ? pulse.name : mode.name,
              value: activePrice ? +value[`price-${index}`] * 100 : 
              isChangeFeatureType || _.isEmpty(mode) ? 0 : mode.value,
              duration: activeDuration ? +(+value[`duration-${index}`] * 60).toFixed() :  
              isChangeFeatureType || _.isEmpty(mode) ? 0 : mode.duration,
            }
          })
        }
      })
      this.setState({ 
        preview: { address: activeAddress, feature: activeFeature, name: activeName, price: activePrice, duration: activeDuration, featureType: activeFeatureType }, 
        devices: devices 
      })
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
    let { form: { resetFields } } = this.props
    let { deviceTypes, active: { name: activeName, price: activePrice, duration: activeDuration } } = this.state
    let type = e.target.value
    // 切换前选择设备类型下的设备
    let activeFeatureTypeMap = _.findWhere(deviceTypes, { type: type }) || {}

    this.setState({ activeFeatureType: type })
    // 切换类型 reset表单的内容
    setTimeout(() => {
      (activeFeatureTypeMap.pulse || []).map((pulse, index) => {
        activeName ? resetFields([`name-${index}`]) : null
        activePrice ? resetFields([`price-${index}`]) : null
        activeDuration ? resetFields([`duration-${index}`]) : null
      })
    }, 0)
  }
  changeSchool(value) {
    this.setState({ activeSchoolId: value })
  }
  render() {
    let { form: { getFieldDecorator } } = this.props
    let { 
      active: { address: activeAddress, feature: activeFeature, name: activeName, price: activePrice, duration: activeDuration }, 
      schools, devices, preview, deviceTypes, featureType, activeFeatureType, activeSchoolId, serviceAddresses
    } = this.state
    let count = devices.length
    // 当前选择设备类型下的设备详情
    let activeFeatureTypeMap = _.findWhere(deviceTypes, { type: activeFeatureType }) || {}
    // 当前选择学校下的服务地点
    let activeSchoolsMap = _.findWhere(schools, { id: activeSchoolId }) || {}

    return (<div className={styles.batchEdit}>
      <Breadcrumb items={breadItems} />

      <div className={styles.top}>
        <p>你将对<span className={styles.hightlight}>{count}</span>个设备进行修改,请选择需要修改的项目:</p>
        { !this.isAssigned ? <Checkbox onChange={this.toggleCheckbox.bind(this, 'address')}>服务地点</Checkbox> : null}
        <Checkbox onChange={this.toggleCheckbox.bind(this, 'feature')}>关联设备类型</Checkbox>
        <Checkbox onChange={this.toggleCheckbox.bind(this, 'name')}>服务名称</Checkbox>
        <Checkbox onChange={this.toggleCheckbox.bind(this, 'price')}>价格</Checkbox>
        { true ? null : <Checkbox onChange={this.toggleCheckbox.bind(this, 'duration')}>服务时间</Checkbox> }
      </div>
      <Form className={styles.form}>
        {
          activeAddress ? <Row>
            <Col xs={24} sm={4}><span className={styles.label}>服务地点</span></Col>
            <Col xs={24} sm={12}>
              <FormItem
                label="">
                {getFieldDecorator('schoolId', {
                  rules: [
                    {required: true, message: '必填'},
                  ],
                  initialValue: ""
                })(
                  <Select
                    showSearch
                    placeholder='请选择学校(非学校服务选"其他")'
                    optionFilterProp="children"
                    onChange={this.changeSchool.bind(this)}
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    <Option value="">请选择学校(非学校服务选"其他")</Option>
                    {(schools || []).map((school) => {
                      return <Option key={school.id} value={school.id}>{school.name}</Option>
                    })}
                  </Select> 
                )}
              </FormItem>
            </Col>
          </Row> : null
        }
        { 
          activeAddress ? <Row>
            <Col xs={{ span: 24 }} sm={{ span: 12, offset: 4 }}>
              <FormItem
                label="">
                {getFieldDecorator('addressId', {
                  rules: [
                    {required: true, message: '必填'},
                  ],
                  initialValue: ""
                })(
                  <Select
                    showSearch
                    optionFilterProp="children"
                    placeholder="请选择服务地点"
                    notFoundContent="搜索无结果">
                      <Option value="">请选择服务地点</Option>
                      { 
                        (activeSchoolsMap.objects || []).map((address) => {
                          return <Option key={address.id} value={address.id}>{address.school.address}</Option>
                        })
                      }
                  </Select>
                )}
              </FormItem> 
            </Col>
          </Row>: null
        }      
        {
          activeFeature ? <FormItem
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
          </FormItem> : null
        }
        {
          activeName ? <Row>
            <Col xs={24} sm={4}><span className={styles.label}>服务名称</span></Col>
            <Col xs={24} sm={20}>
              <Row>
                {(activeFeatureTypeMap.pulse || []).map((pulse, index) => {
                  return <Col sm={Math.floor(24/activeFeatureTypeMap.pulse.length)} xs={24} key={`name-${index}`}><FormItem>
                    {getFieldDecorator(`name-${index}`, {
                      rules: [
                        { required: true, message: '必填' },
                        { max: 20, message: '不超过二十个字' },
                      ],
                      initialValue: pulse.name
                    })(
                      <Input
                      style={{ width: '80%' }}
                      placeholder="服务名称" />
                    )}
                  </FormItem></Col>
                })}
              </Row>
            </Col>
          </Row> : null
        }
        {
          activePrice ? <Row>
            <Col xs={24} sm={4}><span className={styles.label}>价格(无服务填0)</span></Col>
            <Col xs={24} sm={20}>
              <Row>
                {(activeFeatureTypeMap.pulse || []).map((pulse, index) => {
                  return <Col sm={Math.floor(24/activeFeatureTypeMap.pulse.length)} xs={24} key={`price-${index}`}><FormItem>
                    {getFieldDecorator(`price-${index}`, {
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
                      initialValue: conversionUnit((index + 1) * 100)
                    })(
                      <Input
                      style={{ width: '80%' }}
                      prefix={<Icon type="pay-circle-o" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                      placeholder="价格" />
                    )}
                  </FormItem></Col>
                })}
              </Row>
            </Col>
          </Row> : null
        }
        {
          activeDuration ? <Row>
            <Col xs={24} sm={4}><span className={styles.label}>服务时间(分钟)</span></Col>
            <Col xs={24} sm={20}>
              <Row>
                {(activeFeatureTypeMap.pulse || []).map((pulse, index) => {
                  return <Col sm={Math.floor(24/activeFeatureTypeMap.pulse.length)} xs={24} key={`duration-${index}`}><FormItem>
                    {getFieldDecorator(`duration-${index}`, {
                      rules: [
                        { required: true, message: '必填' },
                        { type: 'string', pattern: /^(0|[1-9][0-9]*)$/, message: '请输入正确时间'},
                      ],
                      initialValue: "0"
                    })(
                      <Input
                      style={{ width: '80%' }}
                      prefix={<Icon type="clock-circle-o" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                      placeholder="时间" />
                    )}
                  </FormItem></Col>
                })}
              </Row>
            </Col>
          </Row> : null
        }
        <FormItem {...tailFormItemLayout}>
          <Button style={{ marginRight: 10 }} type="ghost" onClick={this.toPreview.bind(this)}>预览</Button>
          { 
            activeAddress || activeFeature || activePrice || activeName || activeDuration ? <Button type="primary" onClick={this.handleSubmit.bind(this)}>确认修改</Button> : null 
          }
        </FormItem> 
      </Form> 
      <BatchTable
        isAssigned={this.isAssigned}
        devices={devices}
        serviceAddresses={serviceAddresses}
        deviceTypes={deviceTypes}
        featureType={featureType}
        preview={preview} />
    </div>)
  }
}

export default createForm()(BatchMode)
