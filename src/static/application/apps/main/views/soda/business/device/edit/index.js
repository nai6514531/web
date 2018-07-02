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
import { Element } from '../../../../../components/element'
import DEVICE from '../../../../../constant/device'

import styles from '../index.pcss'

const SERIAL_MIN_LENGTH = 6
const DRINKING_URL = 'https://mnzn.net/sod.ac/d/SERIAL'
const DEFAULT_URL = 'https://mnzn.net/?no=SERIAL'

const editBreadItems = [
  {
    title: '设备管理',
    url: '/PATHNAME/business/device'
  },
  {
    title: '修改设备'
  }
]

const addBreadItems = [
  {
    title: '设备管理',
    url: '/PATHNAME/business/device'
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

@Element()
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
          id: 0,
          reference: {
            id: 0
          }
        }
      },
      token: '',
      deviceTypes: [],
      schools: [],
      serviceAddresses: [],
      loading: false,
      activeModal: '',
      activeAddressId: 0,
      activeSchoolId: '',
      activeFeatureId: 0,
      activeReferenceId: 0,
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
        activeAddressId: op(device).get('serviceAddress.id'),
        activeFeatureId: op(device).get('feature.id'),
        activeReferenceId: op(device).get('feature.reference.id'),
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
        let deviceFeature = data[0] || {}
        this.setState({
          deviceTypes: data,
          activeFeatureId: op(deviceFeature).get('id'),
          activeReferenceId: op(deviceFeature).get('references.0.id'),
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
    let { device: { modes }, loading, deviceTypes, activeFeatureId, activeReferenceId } = this.state
    let activeFeatureMap = _.findWhere(deviceTypes, { id: activeFeatureId }) || {}
    let modesGroupByPulseId = _.indexBy(modes || [], (mode) => {
      return mode.presetId
    })

    let isAdd = this.isAdd

    validateFields((errors, value) => {
      if (errors || loading) {
        return
      }
      let serials = (value.serials || '').replace(/(^\s+)|(\s+$)/g, '')
      let feature = {
        id: value.featureId,
        reference: {
          id:  value.referenceId,
        },
      }
      let options = {
        serviceAddress: {
          id: parseInt(value.addressId, 10) || 0
        },
        feature: isAdd ? feature : _.omit(feature, 'id'),
        modes: (op(activeFeatureMap).get('modes') || []).map((modePreset) => {
          let { presetId } = modePreset
          let isNew = _.isEmpty(modesGroupByPulseId[presetId])
          let mode = {
            presetId: presetId,
            name: value[`${activeReferenceId}-${presetId}_NAME`],
            duration: +(+value[`${activeReferenceId}-${presetId}_DURATION`] * 60).toFixed() || 0,
            value: +(+value[`${activeReferenceId}-${presetId}_VALUE`] * 100).toFixed()
          }
          // 模式新增下
          if (!isNew) {
            mode = {
              ...mode,
              id: modesGroupByPulseId[presetId].presetId
            }
          }
          return mode
        })
      }

      if (isAdd) {
        let isInvalid = false
        _.chain(serials.split('\n')).map((serial) => String(serial)).groupBy((serial) => serial.length ).keys().each((length) => {
          if (+length < SERIAL_MIN_LENGTH) {
            isInvalid = true
          }
        })
        if (isInvalid) {
          return message.error('请输入正确的设备编号')
        }
        return this.addDevice({ ...options, serials: serials.split('\n') })
      }
      this.updateDevice({ ...options, serial: serials })
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
    DeviceService.update(Array(options)).then((res) => {
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
  resetTokenConfirm() {
    confirm({
      title: '重置验证码',
      content: `获取重置验证码后，如未将此验证码输入设备验证，将造成设备无法使用。是否确认获取？`,
      iconType: 'exclamation-circle',
      className: `${styles.confirmModal}`,
      onOk: () => {
        this.resetToken()
      }
    })
  }
  resetToken() {
    let { device: { serial }, loading } = this.state
    if (loading) {
      return
    }
    this.setState({ loading: true })
    DeviceService.resetToken({ serial: serial }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({ loading: false, token: res.data })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  changeFeatureId(e) {
    let { device: { feature : { id: featureId, reference: { id: referenceId } } }, deviceTypes } = this.state
    let { form : { setFieldsValue } } = this.props
    let id = e.target.value
    let activeFeatureMap = _.findWhere(deviceTypes || [], { id: id }) || {}
    let activeReferenceId = featureId === id && featureId !== 0 ? referenceId : activeFeatureMap.references[0].id
    this.setState({
      activeFeatureId: id,
      activeReferenceId: activeReferenceId
    })
    setTimeout(() => {
      setFieldsValue({ referenceId: activeReferenceId })
    }, 0)
  }
  changeReferenceId(e) {
    let id = e.target.value
    this.setState({ activeReferenceId: id })
  }
  changeSchool(value) {
    let { form: { setFieldsValue } } = this.props
    setFieldsValue({ addressId: "" })
    this.setState({ activeSchoolId: value })
  }
  changeAddress(value) {
    this.setState({ activeAddressId: value })
  }
  initialActiveModes() {
    let { activeFeatureId, activeReferenceId, deviceTypes, device: { feature: { id: featureId, reference: { id: referenceId } }, modes } } = this.state

    let activeFeatureMap = _.findWhere(deviceTypes || [], { id: activeFeatureId }) || {}
    let modesGroupByPulseId = _.indexBy(modes || [], (mode) => {
      return mode.presetId
    })

    let activeModes = (op(activeFeatureMap).get('modes') || []).map((modePreset) => {
      let mode = modesGroupByPulseId[modePreset.presetId]
      let isEmpty = _.isEmpty(mode) || activeReferenceId !== referenceId
      return {
        id: activeReferenceId + '-' + modePreset.presetId,
        presetId: modePreset.presetId,
        name: isEmpty ? modePreset.name : mode.name,
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
    let { form: { getFieldDecorator }, isVisible } = this.props
    let {
      loading, serviceAddresses, activeModal, deviceTypes, activeFeatureId, activeReferenceId, activeAddressId, activeSchoolId, schools, token,
      device: { id, serial, feature: { id: featureId, reference: { id: referenceId } } }, limit
    } = this.state
    let isAdd = this.isAdd
    // 当前选择学校下的服务地点
    let activeAddress = _.findWhere(serviceAddresses, { id: activeAddressId }) || {}
    activeSchoolId = activeSchoolId === '' ? op(activeAddress).get('school.id') : activeSchoolId
    let activeSchoolsMap = _.findWhere(schools, { id: activeSchoolId }) || {}
    let activeModes = this.initialActiveModes()
    let activeFeatureMap = _.findWhere(deviceTypes || [], { id: activeFeatureId }) || {}
    let url = featureId === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER ? DRINKING_URL : DEFAULT_URL
    let { location: { pathname } } = this.props
    pathname = pathname.split('/')[1]

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
                !this.isAssigned && isVisible('DEVICE:BUTTON:ADDRESS') ? <Col xs={24} sm={{ span: 4, offset: 1 }}>
                  <Button
                    type='primary'
                    className={styles.addressButton}
                    onClick={() => { this.props.history.push(`/${pathname}/business/device/address?fromDevice=true&id=${id}&isAssigned=${this.isAssigned}`)}}>地点管理</Button>
                </Col> : null
              }
            </Row>
          </FormItem>
          {
            this.isAdd ? <FormItem
              {...formItemLayout}
              label="设备类型">
              {getFieldDecorator('featureId', {
                rules: [
                  { required: true, message: '必填' },
                ],
                initialValue: activeFeatureId
              })(
                <RadioGroup onChange={this.changeFeatureId.bind(this)} disabled={this.isAdd ? false: true}>
                  {
                    (deviceTypes || []).map((item) => {
                      return <Radio key={item.id} value={item.id}>{item.name}</Radio>
                    })
                  }
                </RadioGroup>
              )}
            </FormItem> : null
          }
          <FormItem
            {...formItemLayout}
            label="关联设备">
            {getFieldDecorator('referenceId', {
              rules: [
                { required: true, message: '必填' },
              ],
              initialValue: activeReferenceId
            })(
              <RadioGroup onChange={this.changeReferenceId.bind(this)} >
                {
                  (activeFeatureMap.references || []).map((reference) => {
                    return <Radio key={reference.id} value={reference.id}>{reference.name}</Radio>
                  })
                }
              </RadioGroup>
            )}
          </FormItem>
          {
            !_.isEmpty(activeModes) ? (activeModes || []).map((mode, index) => {
              return <Mode
              activeReferenceId={activeReferenceId}
              featureId={featureId}
              referenceId={referenceId}
              mode={mode}
              index={index+1}
              key={mode.id}
              form={this.props.form} />
            }) : null
          }
          {
            !isAdd && featureId !== DEVICE.FEATURE_TYPE_IS_DRINKING_WATER ? <FormItem
              {...formItemLayout}
              label="重置验证码">
              {
                op(limit).get('password.isResettable') ?
                <div>
                  <span>支持</span>
                  <Button style={{ marginLeft: '20px',  marginRight: '20px' }} type='danger' size='small' onClick={this.resetTokenConfirm.bind(this)}>获取</Button>
                </div> :
                <span>不支持</span>
              }
            </FormItem> : null
          }
          {
            token ?  <FormItem
              {...formItemLayout}
              label="验证码">
              <span>{token}</span>
            </FormItem> : null
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
        <QRCode value={url.replace('SERIAL', serial)} />
      </Modal>
    </div>)
  }
}

export default createForm()(Edit)
