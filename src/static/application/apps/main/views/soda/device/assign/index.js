import React, {  Component } from 'react'
import _ from 'underscore'
import op from 'object-path'
import cx from 'classnames'
import Promise from 'bluebird'
import { Steps, Button, Form, Icon, message, Row, Col, Table, Card, Modal, Popconfirm } from 'antd'
const { Step } = Steps
const { Item: FormItem, create: createForm } = Form
const { confirm } = Modal

import UserService from '../../../../services/soda-manager/user'
import DeviceService from '../../../../services/soda-manager/device'
import Breadcrumb from '../../../../components/layout/breadcrumb'
import { InputScan, InputClear } from '../../../../components/form/input'
import { conversionUnit } from '../../../../utils/functions'
import USER from '../../../../constant/user'
import DEVICE from '../../../../constant/device'

import styles from './index.pcss'

const breadItems = [
  {
    title: '设备回收与分配'
  },
  {
    title: '设备分配'
  },
]
const STEPS = [{
    title: '选定设备',
  }, {
    title: '填写运营商账号',
  }, {
    title: '确认分配',
  }, {
    title: '完成',
  }
]

const SERIAL_MIN_LENGTH = 6

const Success = () => {
  return (<div>
    <div><Icon type='check-circle' className={styles.icon} /></div>
    <p>分配成功</p>
  </div>)
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 0,
      loading: false,
      user: {},
      devices: [],
      search: {
        device: {},
        serial: '',
      },
      deviceTypes: [],
    }
    this.columns = [
      {
        title: '设备编号',
        dataIndex: 'serial',
        render: (serial) => {
          return `${serial}`
        }
      }, {
        title: '关联设备',
        dataIndex: 'feature',
        render: (feature) => {
          let { deviceTypes } = this.state
          deviceTypes = _.findWhere(deviceTypes || [], { id : op(feature).get('id') }) || {}
          let reference = _.findWhere(deviceTypes.references || [], { id : op(feature).get('reference.id') }) || {}
          return op(reference).get('name') || '-'
        }
      }, {
        title: '学校',
        dataIndex: 'serviceAddress.school',
        render: (school, record) => {
          return op(school).get('name') || '-'
        }
      }, {
        title: '服务地点',
        dataIndex: 'serviceAddress',
        render: (serviceAddress, record) => {
          return op(serviceAddress).get('school.address') || '-'
        }
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (status) => {
          return op(status).get('description') || '-'
        }
      }, {
        title: '返厂设备',
        render: (record) => {
          let { limit: { isRetrofited } } = record
          
          return <span>{isRetrofited ? '是' : '否'}</span>
        }
      },
      {
        title: '操作',
        render: (text, record) => { 
          return <Popconfirm title="确认删除吗?" onConfirm={this.cancel.bind(this, record.serial)}>
            <a href="#">删除</a>
          </Popconfirm>
        }
      }
    ]
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
  next() {
    let { form: { validateFieldsAndScroll } } = this.props
    let { loading, current, devices } = this.state

    if (loading) {
      return
    }
    // 第一步获取设备信息
    if (current === 0) {
      if (_.isEmpty(devices)) {
        return message.error('当前无分配的设备')
      }
      this.setState({ current: ++current })
      return
    }
    // 第一步获取商家信息
    if (current === 1) {
      return validateFieldsAndScroll((errors, values) => {
        if (errors) {  
          return 
        }
        this.getUserDetail(values.account)
      })
    }
    if (current !== 0 && current !== (STEPS.length -1)) {
      return this.assigned()
    }
    
  }
  prev() {
    let { current, loading } = this.state
    if (loading) {
      return
    }
    this.setState({ current: current === 0 ? 0 : --current })
  }
  assigned() {
    let { devices, user, current, loading } = this.state
    let serials = _.chain(devices).groupBy('serial').keys().union().value()

    if (loading) {
      return
    }
    this.setState({ loading: true })
    DeviceService.assigned({ 
      serials: serials, 
      user: { 
        id: user.id 
      } 
    }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      current++
      this.setState({
        loading: false,
        current: current
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getUserDetail(account) {
    let { current } = this.state
    this.setState({ loading: true })

    UserService.adminUserlist({ 
      fullAccount: account, 
      limit: 1,
      offset: 0,
    }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { objects } = res.data
      let user = _.findWhere(objects, { account: account }) || {}
      if (_.isEmpty(user)) {
        this.setState({ loading: false, user: {} })
        return message.error('运营商账户不存在')
      }
      if (user.id === USER.ID_IS_ROOT_ADMIN) {
        this.setState({ loading: false, user: _.pick(user, 'id', 'mobile', 'name', 'contact', 'account') })
        return message.error('该设备已在系统管理员帐号下')
      }
      if (user.type === USER.TYPE_IS_EMPLOYEE) {
        this.setState({ loading: false, user: _.pick(user, 'id', 'mobile', 'name', 'contact', 'account') })
        return message.error('该帐号为员工帐号，无分配设备权限')
      }
      current++
      this.setState({
        loading: false,
        current: current,
        user: _.pick(user, 'id', 'mobile', 'name', 'contact', 'account')
      })
    }).catch((err) => {
      this.setState({ loading: false, user: {} })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getUserDetailById(id) {
    let { search: { serial, device } } = this.state
    UserService.detail(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({
        search: {
          ...this.state.search,
          device: {
            ...device,
            user: res.data
          },
        },
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false })
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
      let userId = op(device).get('data.user.id')
      if (userId !== USER.ID_IS_ROOT_ADMIN) {
        this.setState({
          search: {
            ...this.state.search,
            device: {
              ...device.data,
              modes: op(modes).get('data.objects'),
            },
          }
        })
        setTimeout(() => {
          this.getUserDetailById(userId)
        }, 0)
        return
      }
      this.setState({
        search: {
          ...this.state.search,
          device: {
            ...device.data,
            modes: op(modes).get('data.objects'),
          },
        },
        loading: false,
      })
    }).catch((err) => {
      this.setState({ loading: false, search: { ...this.state.search, device: {} } })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  search() {
    let { loading, search: { serial }, devices } = this.state
    if (loading) {
      return
    }
    this.setState({ search: { ...this.state.search, device: {} } })
    if (serial.length < SERIAL_MIN_LENGTH) {
      return message.error('请输入正确的设备编号')
    }
    this.getDeviceDetail()
  }
  add() {
    let { devices, search: { serial, device } } = this.state
    let _device = _.findWhere(devices, { serial: device.serial })

    if (!_.isEmpty(_device)) {
      return message.error('该设备编号已在当前列表')
    }
    if (device.feature.id === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER) {
      return confirm({
        title: <span>该饮水设备不支持回收</span>
      })
    }
    this.setState({ devices: [ device, ...devices ], search: { serial: '', device: {} } })
  }
  cancel(serial) {
    let { devices } = this.state
    this.setState({
      devices: _.reject(devices, (device) => {
        return device.serial === serial
      })
    })
  }
  changeInput(key, e) {
    let val = e.target.value || ''
    let type = e.target.type || ''
    let { search } = this.state
    this.setState({ search: { ...search, [`${key}`]: val.replace(/(^\s+)|(\s+$)/g,""), device: {} } })
    if (type === 'scan') {
      setTimeout(() => this.search(), 0)
    }
  }
  success() {
    this.setState({ 
      current: 0,
      search: {
        serial: '',
        device: {}
      },
      devices: [],
    })
  }
  render () {
    let { form: { getFieldDecorator } } = this.props
    let { deviceTypes, devices, search: { device, serial }, user, current, loading } = this.state
    device = op(device)
    let feature = _.findWhere(deviceTypes || [], { id : device.get('feature.id') }) || {}
    let reference = _.findWhere(feature.references || [], { id : device.get('feature.reference.id') }) || {}
    let isDrinkingWater = device.get('feature.id') === DEVICE.FEATURE_TYPE_IS_DRINKING_WATER
    let suffix = isDrinkingWater ? '元/L' : '元'

    return (<div className={styles.view}>
      <Breadcrumb items={breadItems} />
      <div className={styles.content}>
        <Steps current={current} className={styles.steps} size="small" direction="horizontal">
          {
            STEPS.map((item, index) => {
              return <Step key={item.title} title={item.title} />
            })
          }
        </Steps>
        <div className='steps-content'>
          { 
            current === 0 ? <div>
              <Row>
                <InputScan 
                  placeholder='请输入设备编号'
                  style={{ width: 180 , marginRight: 10, marginBottom: 10 }}
                  value={serial}
                  onChange={this.changeInput.bind(this, 'serial')}
                  onPressEnter={this.search.bind(this)} />
                <Button type='primary' onClick={this.search.bind(this)}>筛选</Button>
              </Row>
              { 
                !_.isEmpty(device.get()) ? 
                device.get('user.id') === USER.ID_IS_ROOT_ADMIN ? <Card className={styles.card} type="inner" title='设备详情'>
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
                    <Col xs={{ span: 24 }}><Button onClick={this.add.bind(this)}>确认添加</Button></Col>
                  </Row>
                </Card> : serial === device.get('serial') ? 
                <p>该设备仍在运营商<span className={styles.hightlight}>{device.get('user.name') || '?'}</span> | <span className={styles.hightlight}>{device.get('user.account') || '?'}</span>名下，请先回收再进行分配</p> : null 
                : null
            }
            { !_.isEmpty(devices) ? <Table
                bordered
                scroll={{ x: 980 }}
                style={{ margin: 10, backgroundColor: '#fff' }}
                columns={this.columns}
                rowKey={record => record.serial}
                dataSource={devices}
              /> : null
            }
            </div> : 
            current === 1 ? <div>
              <p>您已选择<span className={styles.hightlight}>{devices.length}个</span>设备进行分配,请输入被分配运营商的<span className={styles.hightlight}>登录账号</span></p>
              <Form>
                <FormItem style= {{ width: '60%', margin: '0 auto' }}>
                  {getFieldDecorator('account', {
                    rules: [
                      {required: true, message: '请输入运营商的登录账号'},
                    ],
                    initialValue: user.account || '',
                  })(
                    <InputClear placeholder="请输入运营商的登录账号"  />
                  )}
                </FormItem>
              </Form>
            </div> : 
            current === 2 ? <p className={styles.tip}>你将把设备分配给：
              <span className={styles.hightlight}>{user.name}</span><i>|</i> 
              <span className={styles.hightlight}>{user.contact}</span><i>|</i> 
              <span className={styles.hightlight}>{user.mobile}</span>，是否继续？
            </p> : 
            current === 3 ? <Success /> : null
          }
        </div>
        <div className={cx(styles.action, 'steps-action')}>
          {
            current < STEPS.length - 1 ?
            <Button type='primary' onClick={() => this.next()} loading={loading} >下一步</Button> : null
          }
          {
            current === STEPS.length - 1 ?
            <Button type='primary' onClick={this.success.bind(this)}>完成</Button> : null
          }
          {
            current > 0 && current !== STEPS.length - 1 ?
            <Button style={{ marginLeft: 8 }} onClick={() => this.prev()} disabled={loading}>
              上一步
            </Button> : null
          }
        </div>
      </div>
    </div>)
  }
}

export default createForm()(App)