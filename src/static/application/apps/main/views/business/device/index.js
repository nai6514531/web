import React, { Component } from 'react'
import _ from 'underscore'
import moment from 'moment'
import op from 'object-path'
import cx from 'classnames'
import querystring from 'querystring'
import { Link } from 'react-router-dom'
import { Table, Button, message, Modal, Popconfirm, Tabs, Form, Row, Col, Select, Popover } from 'antd'
const { TabPane } = Tabs
const { confirm } = Modal
const { Item: FormItem, create: createForm } = Form
const { Option } = Select

import { conversionUnit } from '../../../utils/functions'
import UserService from '../../../services/soda-manager/user'
import DeviceService from '../../../services/soda-manager/device'
import DeviceAddressService from '../../../services/soda-manager/device-service-address'

import Breadcrumb from '../../../components/layout/breadcrumb'
import { InputScan, InputClear } from '../../../components/form/input'
import { Element } from '../../../components/element'
import Modes from './modes'
import Assigned from './assigned'
import DEVICE from '../../../constant/device'

import styles from './index.pcss'

const PAEG_SIZE = 10

const breadItems = [
  {
    title: '苏打生活'
  },
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

const DEVICE_IS_MINE = 0
const DEVICE_IS_ASSIGNED = 1

@Element()
class App extends Component {
  constructor(props) {
    super(props)
    let { isVisible } = this.props
    this.state = {
      devices: [],
      selectedRowKeys: [],
      tapActive: DEVICE_IS_MINE,
      modalActive: '',
      search: {
        keys: '',
        serials: '',
        addressName: '',
        type: 0,
        schoolId: 0
      },
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
        title: '运营商名称',
        dataIndex: 'user',
        label: 'user',
        render: (user) => {
          return `${user.name}-${user.mobile}`
        }
      }, {
        title: '编号',
        dataIndex: 'serial',
      }, {
        title: '服务地点',
        dataIndex: 'serviceAddress',
        render: (serviceAddress, record) => {
          return `${op(serviceAddress).get('school.address') || '-'}` 
        }
      }, {
        title: '状态',
        dataIndex: 'status',
        render: (status) => {
          return `${status.description}`
        }
      }, {
        title: '关联设备类型',
        dataIndex: 'feature',
        render: (feature) => {
          return `${feature.name}`
        }
      }, {
        title: '更新时间',
        dataIndex: 'updatedAt',
        label: 'updatedAt',
        render: (date) => {
          return moment(date).format('YYYY-MM-DD HH:mm:ss')
        }
      }, {
        title: '返厂设备',
        colSpan: isVisible('BUSINESS:DEVICE:SHOW_RESTROFITY') ? 1 : 0,
        render: (record) => {
          if (isVisible('BUSINESS:DEVICE:SHOW_RESTROFITY')) {
            let { assignedUser: { mobile, name }, limit: { isRetrofited } } = record
            let suffix = isRetrofited ? `${'是 ('+ name + mobile + ')'}` : '否'
            
            return {
              children: <span className={cx({ [styles.hightlight]: isRetrofited })}>{suffix}</span>
            }
          }
          return {
            props: {
              colSpan: 0
            }
          }
        }
      }, {
        title: '操作',
        render: (text, record) => {
          let { id, status, serial } = record
          let { tapActive } = this.state
          let isMineDevice = tapActive === DEVICE_IS_MINE
          let isLock = !!~[...DEVICE.STATUS_IS_LOCK].indexOf(status.value)
          let isUsing = !!~[...DEVICE.STATUS_IS_USING].indexOf(status.value)
          let content = (<div>
            {(record.modes || []).map((mode) => {
              return <p key={mode.id}>
                {[`${mode.name || '-'}`, `${conversionUnit(mode.value)}元`, `${mode.duration/1000}分钟`].join(' / ')}
              </p>
            })}
          </div>)
          content = record.modes.length === 0 ? '该设备无服务信息' : content
          return <span>
            <Link to={`/business/device/edit/${id}?isAssigned=${!isMineDevice}`}>修改</Link>
            <Popover placement="topLeft" content={content}>
              <div className={styles.divider}></div><a href="#">查看价格</a>
            </Popover>
            { 
              isVisible("BUSINESS:DEVICE:CANCEL") && isMineDevice ? <Popconfirm title="确认删除吗?" onConfirm={this.delete.bind(this, id)}>
                <div className={styles.divider}></div><a href="#">删除</a>
              </Popconfirm> : null
            }
            { 
              isLock ? <Popconfirm title="确认取消锁定吗?" onConfirm={this.unLock.bind(this, serial)}>
                <div className={styles.divider}></div><a href="#">取消锁定</a>
              </Popconfirm> : 
              isUsing ? <Popconfirm title="确认取消占用?" onConfirm={this.unLock.bind(this, serial)}>
                <div className={styles.divider}></div><a href="#">取消占用</a>
              </Popconfirm> : 
              <Popconfirm title="确认锁定吗?" onConfirm={this.lock.bind(this, Array(serial))}>
                <div className={styles.divider}></div><a href="#">锁定</a>
              </Popconfirm>
            }
          </span>
        }
      }
    ]
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let search = _.pick(query, 'keys', 'serials', 'schoolId', 'addressName', 'type')
    let pagination = _.pick(query, 'limit', 'offset')
    let isMineDevice = query.isAssigned !== 'true' || true
    let tapActive =  query.isAssigned === 'true' ? DEVICE_IS_ASSIGNED : DEVICE_IS_MINE
    this.setState({ tapActive: tapActive })
    this.list({ search, pagination, tapActive: tapActive })
    this.getDeviceServiceAddress()
    this.getDeviceType()
  }
  list({...options}) {
    let { loading } = this.state
    let tapActive = _.isUndefined(options.tapActive) ? this.state.tapActive : options.tapActive
    let search = _.extend(this.state.search, options.search || {})
    let pagination = _.extend(this.state.pagination, options.pagination || {})

    if (loading) {
      return
    }
    this.setState({ loading: true, selectedRowKeys: [] })

    DeviceService.list({ 
      ...search,    
      ..._.pick(pagination, 'limit', 'offset'), 
      isAssigned: tapActive === DEVICE_IS_MINE ? DEVICE_IS_MINE : DEVICE_IS_ASSIGNED
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
          deviceTypes: data
        })
        return
      }
      this.setState({ deviceTypes: data })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  delete(id) {
    let { loading, actionLoading } = this.state

    if (loading || actionLoading) {
      return
    }
    this.setState({ actionLoading: true })
    DeviceService.deleteDevice(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      this.setState({ actionLoading: false })
      this.list()
    }).catch((err) => {
      this.setState({ actionLoading: false })      
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  search() {
    let { loading } = this.state
    if (loading) {
      return
    }
    let pagination = { offset: 0 }
    this.changeHistory(pagination)
    this.list({ pagination })
  }
  onSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys: selectedRowKeys })
  }
  changeHistory(options) {
    let query = _.pick({...this.state.search, ...this.state.pagination, ...options}, 'keys', 'serials', 'limit', 'offset', 'schoolId', 'addressName', 'type')
    query = { ...query , isAssigned: options.tapActive === DEVICE_IS_ASSIGNED }
    this.props.history.push(`/business/device?${querystring.stringify(query)}`)
  }
  changeKeys(key, e) {
    let val = e.target.value || ''
    let { search } = this.state
    this.setState({ search: { ...search, [`${key}`]: val.replace(/(^\s+)|(\s+$)/g,"") } })
  }
  changeAddress(value) {
    let { search } = this.state
    this.setState({ search: { ...search, addressName: value.join(',') } })
  }
  changeSchool(value) {
    let { search } = this.state
    this.setState({ search: { ...search, schoolId: value, addressName: '' } })
  }
  changeType(value) {
    let { search } = this.state
    this.setState({ search: { ...search, type: value } })
  }
  batchLock() {
    let { selectedRowKeys } = this.state
    confirm({
      title: <span>有<span className={styles.hightlight}>{selectedRowKeys.length}</span>个设备将被锁定，是否继续操作?</span>,
      onOk: () => {
        this.lock(selectedRowKeys)
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
  unLock(serial) {
    let { loading, actionLoading } = this.state
    if (loading || actionLoading) {
      return
    }

    this.setState({ actionLoading: true})
    DeviceService.unlock({
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
    let { tapActive, selectedRowKeys, devices } = this.state
    let isAssigned = tapActive !== DEVICE_IS_MINE
    let serials = selectedRowKeys.join(',')
    if (value === 'ALL') {
      let keys = _.chain(devices).filter((device) => {
        return _.contains(selectedRowKeys, device.serial)
      }).groupBy((device) => { return device.feature.type }).keys().value()
      if (keys.length > 1) {
        return confirm({
          title: `关联设备类型相同才可批量修改，请检查`
        })
      }
      this.props.history.push(`/business/device/edit?isAssigned=${isAssigned}&serials=${serials}`) 
    }
  }
  changeTab (key) {
    let options = { 
      tapActive: +key,
      search: { 
        keys: '',
        serials: '',
        schoolId: 0,
        addressName: '',
        type: 0
      },
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      }
    }
    this.setState(options)

    this.list(options)
    this.changeHistory({ tapActive: +key })
  }
  // 设备分配 MODAL
  toggleAssiginedVisible(value) {
    this.setState({ modalActive: '' })
    if (value === 'SUCCESS') {
      this.list()
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
    let { devices, schools, loading, selectedRowKeys, tapActive, modalActive, deviceTypes, search: { keys, serials, schoolId, addressName, type } } = this.state
    let { isVisible } = this.props
    let selectedCount = selectedRowKeys.length
    let hasSelected = selectedCount > 0
    // 当前商家设备列表（非分配列表），不展示更新时间和商家信息
    let columns = tapActive === DEVICE_IS_MINE ? _.reject(this.columns, (item) => { return !!~['updatedAt', 'user'].indexOf(item.label)}) : this.columns
    // 当前选择学校下的服务地点
    let activeSchoolsMap = _.findWhere(schools, { id: +schoolId }) || {}

    return (<div>
      <Breadcrumb items={breadItems} />
      <Tabs 
        activeKey={String(tapActive)}
        onChange={this.changeTab.bind(this)}>
        <TabPane tab="我的设备" key={String(DEVICE_IS_MINE)}></TabPane>
        <TabPane tab="已分配设备" key={String(DEVICE_IS_ASSIGNED)}></TabPane>
      </Tabs>
      <Row>
        <InputScan
          placeholder="请输入设备编号"
          style={{ width: 180 , marginRight: 10, marginBottom: 10 }}
          value={serials}
          onChange={this.changeKeys.bind(this, 'serials')}
          onPressEnter={this.search.bind(this)}
        />
        { 
          tapActive === DEVICE_IS_ASSIGNED ? <InputClear
            style={{ width: 180 , marginRight: 10, marginBottom: 10 }}
            placeholder="请输入用户账户或用户名" 
            value={keys}
            onChange={this.changeKeys.bind(this, 'keys')}
            onPressEnter={this.search.bind(this)}
          /> : null
        }
        { tapActive === DEVICE_IS_MINE ? <Select
            showSearch
            style={{ width: 180, marginRight: 10, marginBottom: 10 }}
            placeholder="请选择学校"
            optionFilterProp="children"
            onChange={this.changeSchool.bind(this)}
            value={+schoolId === 0 ? '' : +schoolId}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          >
            <Option value="">请选择学校</Option>
            {(schools || []).map((school) => {
              return <Option key={school.id} value={school.id}>{school.name}</Option>
            })}
          </Select> : null
        }
        { tapActive === DEVICE_IS_MINE ? <Select
            mode="tags"
            value={!!addressName ? addressName.split(',') : []}
            placeholder='请输入服务地点'
            onChange={this.changeAddress.bind(this)}
            onPressEnter={this.search.bind(this)}
            style={{ width: 180, marginRight: 10, marginBottom: 10 }}
          >
            {(activeSchoolsMap.objects || []).map((item) => {
              return <Option key={item.id} value={String(item.school.address)}>{item.school.address}</Option>
            })}
          </Select> : null 
        }
         <Select
          showSearch
          style={{ width: 180, marginRight: 10, marginBottom: 10 }}
          placeholder="请选择设备类型"
          optionFilterProp="children"
          onChange={this.changeType.bind(this)}
          value={+type === 0 ? '' : +type}
        >
          <Option value="">请选择设备类型</Option>
          {(deviceTypes || []).map((item) => {
            return <Option key={item.type} value={item.type}>{item.name}</Option>
          })}
        </Select>
        <Button type='primary' onClick={this.search.bind(this)}>筛选</Button>
      </Row>
      <Row>
        { 
          tapActive === DEVICE_IS_MINE ? <Button 
          type='primary'
          disabled={!hasSelected}
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={() => { this.setState({ modalActive: 'ASSIGNED'}) }}>批量分配</Button>: null
        }
        <Button 
          type='primary'
          disabled={!hasSelected}
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={this.edit.bind(this, 'ALL')}>批量修改</Button>
        { 
          tapActive === DEVICE_IS_MINE ? <Button 
          type='primary'
          disabled={!hasSelected}
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={this.batchLock.bind(this)}>批量锁定</Button> : null
        }
        { 
          tapActive === DEVICE_IS_MINE && isVisible('BUSINESS:DEVICE:ADD')? <Button 
          type='primary'　
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={() => { this.props.history.push(`/business/device/add?isAssigned=false`) }}>添加新设备</Button> : null
        }
        {
          tapActive === DEVICE_IS_MINE ? <Button 
          type='primary'
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={() => { this.props.history.push('/business/device/address')}}>地点管理</Button> : null
        }
      </Row>
      { 
        hasSelected ? <Row>
          <span style={{ marginLeft: 8, marginRight: 8, fontSize: 12 }}>
            已选 {selectedCount} 设备
          </span>
        </Row> : null
      }
      <Table
        className={styles.table}
        rowSelection={this.rowSelection()}
        scroll={{ x: 980 }}
        style={{ marginTop: 16 }}
        columns={columns}
        rowKey={record => record.serial}
        dataSource={devices}
        pagination={this.pagination()}
        onChange={this.handleTableChange.bind(this)}
        loading={loading}
      />
      { 
        modalActive === 'ASSIGNED' ? <Assigned 
        toggleVisible={this.toggleAssiginedVisible.bind(this)}
        serials={selectedRowKeys} /> : null
      }
    </div>)
  }
}

export default createForm()(App)
