import React, { Component } from 'react'
import _ from 'underscore'
import Promise from 'bluebird'
import moment from 'moment'
import km from 'keymirror'
import op from 'object-path'
import cx from 'classnames'
import querystring from 'querystring'
import { Link } from 'react-router-dom'
import { Card, Table, Button, message, Modal, Popconfirm, DatePicker, Tabs, Form, Row, Col, Select, Popover, Spin, Alert } from 'antd'
const { TabPane } = Tabs
const { confirm } = Modal
const { Item: FormItem, create: createForm } = Form
const { Option } = Select

import { conversionUnit } from '../../../../../utils/functions'
import DeviceService from '../../../../../services/soda-manager/device'
import DeviceAddressService from '../../../../../services/soda-manager/device-service-address'

import Breadcrumb from '../../../../../components/layout/breadcrumb'
import { InputScan, InputClear } from '../../../../../components/form/input'

import DEVICE from '../../../../../constant/device'

import styles from '../index.pcss'

const PAEG_SIZE = 10
const SERIAL_MIN_LENGTH = 6

const breadItems = [
  {
    title: '运行状态查询'
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

class App extends Component {
  constructor(props) {
    super(props)
    let { isVisible } = this.props
    this.state = {
      devices: [],
      search: {
        serials: '',
        schoolId: '',
        serviceAddressIds: '',
        referenceId: 0,
        startAt: moment(moment(new Date()).format("YYYY-MM-DD")).subtract(7, 'days').format(),
        endAt: moment(moment(new Date()).format("YYYY-MM-DD")).format(),
      },
      serviceAddresses: [],
      deviceTypes: [],
      configDetail: {
        onCount: 0,
        offCount: 0,
      },
      schools: [],
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      },
      endOpen: false,
      loading: false,
    }
    this.columns = [
      {
        title: '设备编号',
        dataIndex: 'id',
        render: (id, record) => {
          return `${record.serial}`
        }
      }, {
        title: '学校',
        dataIndex: 'school',
        render: (address, record) => {
          // let { serviceAddresses } = this.state
          // address = _.findWhere(serviceAddresses || [], { id : op(record).get('serviceAddress.id') }) || {}
          return op(record).get('serviceAddress.school.name') || '-'
        }
      }, {
        title: '服务地点',
        dataIndex: 'serviceAddress',
        render: (address, record) => {
          // let { serviceAddresses } = this.state
          // address = _.findWhere(serviceAddresses || [], { id : op(address).get('id') }) || {}
          return op(address).get('school.address') || '-'
        }
      }, {
        title: '关联设备类型',
        dataIndex: 'feature',
        render: (feature) => {
          let { deviceTypes } = this.state
          deviceTypes = _.findWhere(deviceTypes || [], { id : op(feature).get('id') }) || {}
          let reference = _.findWhere(deviceTypes.references || [], { id : op(feature).get('reference.id') }) || {}
          return op(reference).get('name') || '-'
        }
      }, {
        title: '故障时间',
        dataIndex: 'createdAt',
        render: (createdAt) => {
          return moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
        }
      }, {
        title: '运行状态描述',
        dataIndex: 'status',
        render: (status) => {
          return `${status.description || '-'}`
        }
      }
    ]
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let search = _.pick(query, 'serials', 'serviceAddressIds', 'referenceId', 'schoolId', 'startAt', 'endAt')
    let pagination = _.pick(query, 'limit', 'offset')
    this.getDeviceServiceAddress()
    this.list({ search, pagination })
    this.getDeviceType()
    this.getDeviceConfigDetail()
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

    DeviceService.log({
      deviceTypes: DEVICE.FEATURE_TYPE_IS_DRINKING_WATER,
      serviceAddressIds: serviceAddressIds,
      ..._.pick(search, 'startAt', 'endAt', 'serials', 'referenceId'), 
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
  getDeviceConfigDetail() {
    DeviceService.configDetail({ deviceType: DEVICE.FEATURE_TYPE_IS_DRINKING_WATER }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data } = res
      this.setState({ configDetail: data })
    }).catch((err) => {
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
  changeHistory(options) {
    let { location: { pathname } } = this.props
    pathname = pathname.split('/')[1]
    let query = _.pick({...this.state.search, ...this.state.pagination, ...options}, 'serviceAddressIds', 'serials', 'startAt', 'endAt', 'limit', 'offset', 'referenceId', 'schoolId')

    this.props.history.push(`/${pathname}/business/device-config?${querystring.stringify(query)}`)
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
  onChangeDate (field, value) {
    const date = moment(moment(value).format('YYYY-MM-DD')).format()
    //　更新开始时间，则触发结束时间,保持与其一致
    const search = { ...this.state.search, endAt: !!value ? date : '', [field]: !!value ? date : '' }
    this.setState({ search: search });
  }
  onStartChange (value) {
    this.onChangeDate('startAt', value);
  }
  onEndChange (value) {
    this.onChangeDate('endAt', value);
  }
  disabledStartDate(current) {
    return current && current.valueOf() > Date.now();
  }
  disabledEndDate (current) {
    const second = 31 * 24 * 60 * 60 * 1000;
    const startAt = this.state.search.startAt ? moment(this.state.search.startAt).valueOf() : '';
    if (!startAt) {
      return true;
    }
    // 结束时间和开始时间跨度　大于等于３1天
    // 获取截至结束时间
    const endDate =  Date.now() < startAt + second ? Date.now() : startAt + second
    return current && current.valueOf() < startAt || current && current.valueOf() > endDate
  }
  handleStartOpenChange (open) {
    if (!open) {
      this.setState({
        endOpen: true
      });
    }
  }
  handleEndOpenChange(open) {
    this.setState({
      endOpen: open
    })
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
  render() {
    let { devices, users, schools, loading, deviceTypes, configDetail, search: { serials, schoolId, serviceAddressIds, referenceId, startAt, endAt } } = this.state

    // 当前选择学校下的服务地点
    let activeSchoolsMap = _.findWhere(schools || [], { id: schoolId === '' ? '' : +schoolId }) || {}

    return (<div>
      <Breadcrumb items={breadItems} location={this.props.location} />
      <Card className={styles.card}>
        <p>当前在线设备<span>{configDetail.onCount}</span>台, 离线设备<span>{configDetail.offCount}</span>台</p>
      </Card>
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
          placeholder="请选择关联设备类型"
          optionFilterProp="children"
          onChange={this.changeReferenceId.bind(this)}
          value={+referenceId === 0 ? '' : +referenceId}
        >
          <Option value="">请选择关联设备类型</Option>
          {(deviceTypes || []).map((feature) => {
            return (feature.references || []).map((reference) => {
              return <Option key={reference.id} value={reference.id}>{reference.name}</Option>
            })
          })}
        </Select>
        <DatePicker
          placeholder='开始日期'
          format="YYYY-MM-DD"
          style={{　width: 120, marginRight: 5, marginBottom: 10, verticalAlign: 'bottom'　}}
          value={!!startAt ? moment(startAt) : null}
          disabledDate={this.disabledStartDate.bind(this)}
          onChange={this.onStartChange.bind(this)}
          onOpenChange={this.handleStartOpenChange.bind(this)}
        />
        -
        <DatePicker
          placeholder='结束日期'
          format='YYYY-MM-DD'
          style={{　width: 120, marginLeft: 5, marginRight: 10, marginBottom: 10, verticalAlign: 'bottom'　}}
          value={!!endAt ? moment(endAt) : null}
          open={this.state.endOpen}
          disabledDate={this.disabledEndDate.bind(this)}
          onChange={this.onEndChange.bind(this)}
          onOpenChange={this.handleEndOpenChange.bind(this)}
        />
        <Button type='primary' onClick={this.search.bind(this)}>筛选</Button>
      </Row>
      <Table
        className={styles.table}
        columns={this.columns}
        scroll={{ x: 980 }}
        style={{ marginTop: 16 }}
        rowKey={record => record.id}
        dataSource={devices}
        pagination={this.pagination()}
        onChange={this.handleTableChange.bind(this)}
        loading={loading}
      />
    </div>)
  }
}

export default createForm()(App)
