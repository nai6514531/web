import React, { Component } from 'react'
import { Button, Card, message, Modal, Form, Row, Col } from 'antd'
const { confirm } = Modal
const { Item: FormItem, create: createForm } = Form
import op from 'object-path'
import _ from 'underscore'
import Promise from 'bluebird'
import cx from 'classnames'

import Breadcrumb from '../../../../components/layout/breadcrumb'
import { InputScan } from '../../../../components/form/input'
import { conversionUnit } from '../../../../utils/functions'
import UserService from '../../../../services/soda-manager/user'
import DeviceService from '../../../../services/soda-manager/device'
import DEVICE from '../../../../constant/device'
import USER from '../../../../constant/user'

import styles from './index.pcss'

const breadItems = [
  {
    title: '设备回收与分配'
  },
  {
    title: '设备回收'
  },
]
const SERIAL_MIN_LENGTH = 6

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      device: {},
      user: {},
      deviceTypes: [],
      search: {
        serial: '',
      },
      loading: false,
    }
  }
  componentWillMount() {
    this.getDeviceType()
  }
  getDeviceType() {
    DeviceService.deviceType().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data } = res
      this.setState({ deviceTypes: data })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getDeviceDetail() {
    let { search: { serial }, loading } = this.state
    if (loading) {
      return
    }
    this.setState({ loading: true })
    Promise.all([
      DeviceService.detail(serial),
      DeviceService.deviceModeList({ serials: serial }),
    ]).then((res) => {
      let device = res[0]
      let modes = res[1]
      if (device.status !== 'OK' || modes.status !== 'OK') {
        throw new Error(device.message || modes.message)
      }
      this.getUserDetail(op(device).get('data.user.id'))
      this.setState({
        device: {
          ...device.data,
          modes: op(modes).get('data.objects'),
        },
        loading: false,
      })
    }).catch((err) => {
      this.setState({ loading: false, device: {}, user: {} })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getUserDetail(id) {
    UserService.detail(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({
        user: res.data || {}
      })
    }).catch((err) => {   
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  search() {
    let { loading, search: { serial } } = this.state
    if (loading) {
      return
    }
    if (serial.length < SERIAL_MIN_LENGTH) {
      return message.error('请输入正确的设备编号')
    }
    this.getDeviceDetail()
  }
  reset() {
    let { device, loading } = this.state
    if (loading) {
      return
    }
    this.setState({ loading: true })
    DeviceService.reset({serials: [device.serial]}).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      message.success('回收成功')
      this.setState({
        loading: false,
      })
      this.getDeviceDetail()
    }).catch((err) => {   
      message.error(err.message || '服务器异常，刷新重试')
       this.setState({
        loading: false,
      })
    })
  }
  changeInput(key, e) {
    let val = e.target.value || ''
    let type = e.target.type || ''
    let { search } = this.state
    this.setState({ search: { ...search, [`${key}`]: val.replace(/(^\s+)|(\s+$)/g,"") } })
    if (type === 'scan') {
      setTimeout(() => this.search(), 0)
    }
  }
  confirm() {
    let { device } = this.state
    let userId = op(device).get('user.id')
    if (device.feature.id === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER) {
      return confirm({
        title: <span>该饮水设备不支持回收</span>
      })
    }
    if (userId === USER.ID_IS_ROOT_ADMIN) {
      return confirm({
        title: <span><span className={styles.hightlight}>{device.serial}</span>设备已在系统管理员下，请勿重复操作</span>
      })
    }
    confirm({
      title: <span><span className={styles.hightlight}>{device.serial}</span>设备将被回收，是否继续操作?</span>,
      onOk: () => {
        this.reset()
      }
    })
  }
  render() {
    let { device, deviceTypes, user, search: { serial } } = this.state
    device = op(device)
    user = op(user)
    deviceTypes = _.findWhere(deviceTypes || [], { id : device.get('feature.id') }) || {}
    let reference = _.findWhere(deviceTypes.references || [], { id : device.get('feature.reference.id') }) || {}
    let isDrinkingWater = device.get('feature.id') === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER
    let suffix = isDrinkingWater ? '元/L' : '元'

    return (<div className={styles.view}>
      <Breadcrumb items={breadItems} />
      <Row>
        <InputScan 
          placeholder="请输入设备编号"
          style={{ width: 180 , marginRight: 10, marginBottom: 10 }}
          value={serial}
          onChange={this.changeInput.bind(this, 'serial')}
          onPressEnter={this.search.bind(this)} />
        <Button type='primary' onClick={this.search.bind(this)}>筛选</Button>
      </Row>
      {
        !_.isEmpty(device.get()) ? <Card className={styles.card} type="inner" title='设备详情'>
          <Row>
            <Col xs={{ span: 24 }}><label>设备编号：</label><span>{device.get('serial') || '-'}</span></Col>
            <Col xs={{ span: 24 }}><label>关联设备：</label><span>{op(reference).get('name') || '-'}</span></Col>
            <Col xs={{ span: 24 }}>
              <label>服务单价：</label>
              <span>
                {(device.get('modes') || []).map((mode) => {
                  return [`${conversionUnit(mode.value)}${suffix}`, `${mode.name}`].join(' ')
                }).join('，')}
              </span>
            </Col>
            <Col xs={{ span: 24 }}>
              <label>服务地点：</label>
              <span>
                { _.isEmpty(device.get('serviceAddress')) ? '-' :
                  _.without([device.get('serviceAddress.school.province.name'), device.get('serviceAddress.school.city.name'), device.get('serviceAddress.school.name'), device.get('serviceAddress.school.address')], '').join(' / ') || '-'
                }
              </span>
            </Col>
            <Col xs={{ span: 24 }}><label>状态：</label><span>{device.get('status.description') || '-'}</span></Col>
          </Row>
        </Card> : null 
      }
      {
        !_.isEmpty(user.get()) ? <Card className={styles.card} type="inner" title='运营商详情'>
          <Row>
            <Col xs={{ span: 24 }}><label>商家名称：</label><span>{user.get('name') || '-'}</span></Col>
            <Col xs={{ span: 24 }}><label>登录账号：</label><span>{user.get('account') || '-'}</span></Col>
            <Col xs={{ span: 24 }}><label>手机号：</label><span>{user.get('mobile') || '-'}</span></Col>
            <Col xs={{ span: 24 }}><label>服务电话：</label><span>{user.get('telephone') || '-'}</span></Col>
          </Row>
        </Card> : null 
      }
      {
        !_.isEmpty(device.get()) ? <Row>
          <Button type='primary' onClick={this.confirm.bind(this)}>确认回收</Button>
        </Row> : null
      }
    </div>)
  }
}

export default createForm()(App)