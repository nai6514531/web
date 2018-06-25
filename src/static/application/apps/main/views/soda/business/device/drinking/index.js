import React, { Component } from 'react'
import _ from 'underscore'
import Promise from 'bluebird'
import moment from 'moment'
import km from 'keymirror'
import op from 'object-path'
import cx from 'classnames'
import querystring from 'querystring'
import { Link } from 'react-router-dom'
import { Table, Button, message, Modal, Popconfirm, Tabs, Form, Row, Col, Select, Popover, Spin, Alert } from 'antd'
const { TabPane } = Tabs
const { confirm } = Modal
const { Item: FormItem, create: createForm } = Form
const { Option } = Select

import { conversionUnit } from '../../../../../utils/functions'
import DeviceService from '../../../../../services/soda-manager/device'
import DeviceAddressService from '../../../../../services/soda-manager/device-service-address'

import Breadcrumb from '../../../../../components/layout/breadcrumb'
import { InputScan, InputClear } from '../../../../../components/form/input'
import { Element } from '../../../../../components/element'

import DEVICE from '../../../../../constant/device'

import styles from '../index.pcss'

const PAEG_SIZE = 10
const SERIAL_MIN_LENGTH = 6

const STATUS = [{
    'id': 0,
    'name': '空闲',
  },
  {
    'id': 9,
    'name': '已锁定',
  },
  {
    'id': 1,
    'name': '使用中',
  },
]
const breadItems = [
  {
    title: '设备管理'
  }
]

const formItemLayout = {
  labelCol: {
    xs: { span: 7 },
    sm: { span: 7 }
  },
  wrapperCol: {
    xs: { span: 13 },
    sm: { span: 13 },
  },
}

@Element()
class App extends Component {
  constructor(props) {
    super(props)
    let { isVisible } = this.props
    this.state = {
      devices: [],
      selectedRowKeys: [],
      modalActive: '',
      search: {
        status: '',
        serials: '',
        schoolId: '',
        serviceAddressIds: '',
        referenceId: 0,
      },
      modes: [],
      serviceAddresses: [],
      deviceTypes: [],
      schools: [],
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      },
      loading: false,
      actionLoading: false
    }
    this.columns = [
      {
        title: '设备编号',
        dataIndex: 'serial',
        render: (serial) => {
          return <Link to={`/soda-drinking/business/device/${serial}` + this.props.location.search}>{serial}</Link>
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
          let { serviceAddresses } = this.state
          let address = _.findWhere(serviceAddresses || [], { id : op(record).get('serviceAddress.id') }) || {}
          return op(address).get('school.name') || '-'
        }
      }, {
        title: '服务地点',
        dataIndex: 'serviceAddress',
        render: (address, record) => {
          let { serviceAddresses } = this.state
          address = _.findWhere(serviceAddresses || [], { id : op(address).get('id') }) || {}
          return op(address).get('school.address') || '-'
        }
      }, {
        title: '在线状态',
        dataIndex: 'onlineStatus',
        render: (onlineStatus) => {
          return <span className={ op(onlineStatus).get('value') == 1 ? styles.online : styles.offline }>
            {op(onlineStatus).get('description') || '-'}
          </span>
        }
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (status) => {
          let { value } = status
          return <span>
            {op(status).get('description') || '-'}
          </span>
        }
      }, {
        title: '操作',
        render: (text, record) => {
          let { serial, id } = record
          let { modes, actionLoading } = this.state

          modes = _.filter(modes || [], (mode) => mode.serial === serial && mode.value !== 0 ) || []
          let content = (<div key={serial}>
            {(modes || []).map((mode) => {
              return <p key={mode.id}>
                {[`${mode.name || '-'}`, `${conversionUnit(mode.value)}元/L`].join(' / ')}
              </p>
            })}
          </div>)
          let loading =(<Spin>
            <Alert description="设备服务信息"
              type="info"
            />
          </Spin>)
          content = actionLoading ? loading : _.isEmpty(modes) ? '该设备无服务信息' : content
          return <span>
            { isVisible('DEVICE:BUTTON:EDIT_DEVICE') ? <Link to={`/soda-drinking/business/device/edit/${serial}`}>修改</Link> : null }
            { isVisible('DEVICE:BUTTON:EDIT_DEVICE') ? <div className={styles.divider}></div> : null }
            <Popover placement="topLeft"
              onVisibleChange={this.getDeviceModes.bind(this, serial)}
              content={content}>
              <a href="#">查看价格</a>
            </Popover>
          </span>
        }
      }
    ]
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let search = _.pick(query, 'status', 'serials', 'serviceAddressIds', 'referenceId', 'schoolId')
    let pagination = _.pick(query, 'limit', 'offset')
    this.getDeviceServiceAddress()
    this.list({ search, pagination })
    this.getDeviceType()
  }
  list({...options}) {
    let { loading, serviceAddresses, schools } = this.state
    let search = _.extend(this.state.search, options.search || {})
    let pagination = _.extend(this.state.pagination, options.pagination || {})
    let { schoolId, serviceAddressIds } = search
    schools = _.findWhere(schools, { id: schoolId === '' ? '' : +schoolId }) || {}
    let activeAddressesMapIds = _.pluck(schools.objects || [], 'id')
    serviceAddressIds = _.isEmpty(serviceAddressIds) ? activeAddressesMapIds.join(',') : serviceAddressIds

    if (loading) {
      return
    }
    this.setState({ search: { ...this.state.search, ...search }, pagination: { ...this.state.pagination, ...pagination }, loading: true, selectedRowKeys: [] })

    DeviceService.list({
      deviceTypes: DEVICE.FEATURE_TYPE_IS_DRINKING_WATER,
      serviceAddressIds: serviceAddressIds,
      ..._.pick(search, 'keys', 'serials', 'referenceId', 'status'),
      ..._.pick(pagination, 'limit', 'offset'),
    }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let data = res.data
      this.setState({
        devices: data.objects || [],
        pagination: {
          ...pagination,
          total: data.pagination.total
        },
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  // 获取设备服务地点
  getDeviceServiceAddress(ids) {
    let { serviceAddresses } = this.state
    DeviceAddressService.list({
      ids: ids ? ids.join(',') : ''
    }).then((res) => {
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
        serviceAddresses: [ ...serviceAddresses, ...objects ]
      })
    })
  }
  // 获取设备类型
  getDeviceType() {
    DeviceService.deviceType({ deviceTypes: DEVICE.FEATURE_TYPE_IS_DRINKING_WATER }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data } = res
      this.setState({ deviceTypes: data })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getDeviceModes(serial) {
    let { modes, actionLoading } = this.state
    let hasModes = !_.chain(modes).filter((mode) => mode.serial === serial).isEmpty().value()
    if (actionLoading || hasModes) {
      return
    }

    this.setState({ actionLoading: true })
    DeviceService.deviceModeList({ serials: serial }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res
      this.setState({
        modes: [...modes, ...objects ],
        actionLoading: false
      })
    }).catch((err) => {
      this.setState({ actionLoading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  search() {
    let { loading, search: { serials } } = this.state
    if (loading) {
      return
    }
    let isInvalid = false
    _.chain(serials.split(',')).map((serial) => String(serial)).groupBy((serial) => serial.length).keys().each((length) => {
      if (+length < SERIAL_MIN_LENGTH) {
        isInvalid = true
      }
    })
    if (isInvalid && !_.isEmpty(serials)) {
      return message.error('请输入正确的设备编号')
    }
    let pagination = { offset: 0 }
    this.changeHistory(pagination)
    this.list({ pagination })
  }
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys: selectedRowKeys })
  }
  changeHistory(options) {
    let { location: { pathname } } = this.props
    pathname = pathname.split('/')[1]
    let query = _.pick({...this.state.search, ...this.state.pagination, ...options}, 'serviceAddressIds', 'serials', 'status', 'limit', 'offset', 'referenceId', 'schoolId')

    this.props.history.push(`/${pathname}/business/device?${querystring.stringify(query)}`)
  }
  changeInput(key, e) {
    let val = e.target.value || ''
    let { search } = this.state
    this.setState({ search: { ...search, [`${key}`]: val.replace(/(^\s+)|(\s+$)/g,"") } })
  }
  changeAddress(ids) {
    let { search } = this.state
    this.setState({ search: { ...search, serviceAddressIds: ids.join(',') } })
  }
  changeSchool(value) {
    let { search } = this.state
    this.setState({ search: { ...search, schoolId: value, serviceAddressIds: '' } })
  }
  changeReferenceId(value) {
    let { search } = this.state
    this.setState({ search: { ...search, referenceId: value } })
  }
  changeStatus(value) {
    let { search } = this.state
    this.setState({ search: { ...search, status: value } })
  }
  confirmOperation(operation) {
    let { selectedRowKeys } = this.state
    let suffix = operation === 'SETON' ? '开机' :
      operation === 'SETOFF' ? '关机' :
      operation === 'SETONHOT' ? '开启制热' :
      operation === 'SETOFFHOT' ? '关闭制热' :  ''
    confirm({
      title: <span>有<span className={styles.hightlight}>{selectedRowKeys.length}</span>个设备将被{suffix}，是否继续操作?</span>,
      onOk: () => {
        let suffix = operation === this.setOn() ? '' :
          operation === this.setOn() ? '' :
          operation === this.setOn() ? '' :
          operation === this.setOn() ? '' :  ''
      }
    })
  }
  lock(serialsArray) {
    let { loading, actionLoading } = this.state
    if (loading || actionLoading) {
      return
    }

    this.setState({ actionLoading: true})
    DeviceService.lock({
      serials: serialsArray
    }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.list()
      this.setState({ actionLoading: false })
    }).catch((err) => {
      this.setState({ actionLoading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  setOn() {
    let { selectedRowKeys } = this.state
    let { loading, actionLoading } = this.state
    if (loading || actionLoading) {
      return
    }

    this.setState({ actionLoading: true})
    DeviceService.lock({
      serials: selectedRowKeys
    }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.list()
      this.setState({ actionLoading: false })
    }).catch((err) => {
      this.setState({ actionLoading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  setOff(serialsArray) {}
  lock(serialsArray) {}
  unLock(serial) {
    let { loading, actionLoading } = this.state
    if (loading || actionLoading) {
      return
    }

    this.setState({ actionLoading: true})
    DeviceService.setOn({
      serials: Array(serial)
    }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.list()
      this.setState({ actionLoading: false })
    }).catch((err) => {
      this.setState({ actionLoading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  edit(value) {
    let { selectedRowKeys, devices } = this.state
    let serials = selectedRowKeys.join(',')
    if (value === 'ALL') {
      let keys = _.chain(devices).filter((device) => {
        return _.contains(selectedRowKeys, device.serial)
      }).groupBy((device) => { return op(device).get('feature.id') }).keys().value()
      if (keys.length > 1) {
        return confirm({
          title: `关联设备相同才可批量修改，请检查`
        })
      }
      this.props.history.push(`/soda-drinking/business/device/edit?serials=${serials}`)
    }
  }
  pagination() {
    let { pagination: { total, offset, limit } } = this.state
    return {
      total: total,
      current: parseInt(offset / limit) + 1,
      pageSize: parseInt(limit, 10),
      showSizeChanger: true,
      showTotal (data) {
        return <span>总计 {data} 条</span>
      }
    }
  }
  handleTableChange(pagination) {
    let { current, pageSize } = pagination
    let offset = (current - 1) * pageSize
    this.changeHistory({ limit: pageSize, offset: offset })
    this.list({ pagination: { limit: pageSize, offset: offset } })
  }
  rowSelection() {
    let { selectedRowKeys } = this.state

    return {
      selectedRowKeys,
      onChange: this.onSelectChange.bind(this)
    }
  }
  render() {
    let { isVisible } = this.props
    let { devices, users, schools, loading, selectedRowKeys, deviceTypes, search: { status, serials, schoolId, serviceAddressIds, referenceId } } = this.state
    let selectedCount = selectedRowKeys.length
    let hasSelected = selectedCount > 0

    // 当前选择学校下的服务地点
    let activeSchoolsMap = _.findWhere(schools || [], { id: schoolId === '' ? '' : +schoolId }) || {}

    return (<div>
      <Breadcrumb items={breadItems} location={this.props.location} />
      <Row>
        <InputScan
          placeholder="请输入设备编号"
          style={{ width: 180 , marginRight: 10, marginBottom: 10 }}
          value={serials}
          onChange={this.changeInput.bind(this, 'serials')}
          onPressEnter={this.search.bind(this)}
        />
        <Select
          showSearch
          style={{ width: 240, marginRight: 10, marginBottom: 10 }}
          placeholder='请选择学校(非学校服务选"其他")'
          optionFilterProp="children"
          onChange={this.changeSchool.bind(this)}
          value={schoolId === '' ? '' : +schoolId}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          <Option value="">请选择学校(非学校服务选"其他")</Option>
          {(schools || []).map((school) => {
            return <Option key={school.id} value={school.id}>{school.name}</Option>
          })}
        </Select>
        <Select
            mode="multiple"
            value={!!serviceAddressIds ? serviceAddressIds.split(',') : []}
            placeholder='请输入服务地点'
            onChange={this.changeAddress.bind(this)}
            onPressEnter={this.search.bind(this)}
            style={{ width: 180, marginRight: 10, marginBottom: 10 }}
          >
            {(activeSchoolsMap.objects || []).map((item) => {
              return <Option key={item.id} value={String(item.id)}>{item.school.address}</Option>
            })}
        </Select>
        <Select
          showSearch
          style={{ width: 160, marginRight: 10, marginBottom: 10 }}
          placeholder="请选择关联设备"
          optionFilterProp="children"
          onChange={this.changeReferenceId.bind(this)}
          value={+referenceId === 0 ? '' : +referenceId}
        >
          <Option value="">请选择关联设备</Option>
          {(deviceTypes || []).map((feature) => {
            return (feature.references || []).map((reference) => {
              return <Option key={reference.id} value={reference.id}>{reference.name}</Option>
            })
          })}
        </Select>
        {
          false ? <Select
            showSearch
            style={{ width: 160, marginRight: 10, marginBottom: 10 }}
            placeholder="运行状态"
            optionFilterProp="children"
            onChange={this.changeStatus.bind(this)}
            value={+status === 0 ? '' : +status}
          >
            <Option value="">请选择运行状态</Option>
            {(STATUS || []).map((status) => {
              return <Option key={status.id} value={status.id}>{status.name}</Option>
            })}
          </Select> : null
        }
        <Button type='primary' onClick={this.search.bind(this)}>筛选</Button>
      </Row>
      {
        false ? <Row>
        <Button
          type='primary'
          disabled={!hasSelected}
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={this.confirmOperation.bind(this, 'SETON')}>
          批量开机
        </Button>
        <Button
          type='primary'
          disabled={!hasSelected}
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={this.confirmOperation.bind(this, 'SETOFF')}>
          批量关机
        </Button>
        <Button
          type='primary'
          disabled={!hasSelected}
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={this.confirmOperation.bind(this, 'SETONHOT')}>
          批量开启制热
        </Button>
        <Button
          type='primary'
          disabled={!hasSelected}
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={this.confirmOperation.bind(this, 'SETOFFHOT')}>
          批量关闭制热
        </Button>
        <Button
          type='primary'
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={() => { this.props.history.push('/soda-drinking/business/device/address?fromDevice=true')}}>地点管理
        </Button>
      </Row> : null
      }
      { 
        isVisible('DEVICE:BUTTON:ADDRESS') ? <Row>
          <Button
            type='primary'
            style={{ marginRight: 10, marginBottom: 10 }}
            onClick={() => { this.props.history.push('/soda-drinking/business/device/address?fromDevice=true')}}>地点管理
          </Button>
        </Row> : null
      }
      {
        hasSelected ? <Row>
          <span style={{ marginLeft: 8, marginRight: 8, fontSize: 12 }}>
            已选 {selectedCount} 设备
          </span>
        </Row> : null
      }
      <Table
        className={styles.table}
        columns={this.columns}
        rowSelection={this.rowSelection()}
        scroll={{ x: 980 }}
        style={{ marginTop: 16 }}
        rowKey={record => record.serial}
        dataSource={devices}
        pagination={this.pagination()}
        onChange={this.handleTableChange.bind(this)}
        loading={loading}
        bordered
      />
    </div>)
  }
}

export default createForm()(App)
