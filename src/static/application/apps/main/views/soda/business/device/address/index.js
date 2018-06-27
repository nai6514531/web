import React, {  Component }from 'react'
import { Link } from 'react-router-dom'
import _ from 'underscore'
import querystring from 'querystring'
import { Table, Button, message, Modal, Select } from 'antd'
const { confirm } = Modal
const { Option } = Select

import { InputClear } from '../../../../../components/form/input'
import DeviceAddressService from '../../../../../services/soda-manager/device-service-address'

import Breadcrumb from '../../../../../components/layout/breadcrumb'

import styles from '../index.pcss'

const PAEG_SIZE = 10

const breadItems = [
  {
    title: '地点管理'
  }
]

const deviceBreadItems = [
  {
    title: '设备管理',
    url:'/PATHNAME/business/device'
  },
  {
    title: '地点管理'
  }
]

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      serviceAddresses: [],
      list: [],
      search: {
        keys: '',
        schoolId: '',
        addressName: ''
      },
      schools: [],
      pagination: {
        total: 0,
        limit: PAEG_SIZE,
        offset: 0
      }
    }
    this.columns = [
      {
        title: '序号',
        dataIndex: 'id',
      }, {
        title: '省市',
        dataIndex: 'school.id',
        render: (id, record) => {
          let { school: { province, city } } = record
          return _.without([`${province.name}`, `${city.name || ''}`], '').join('') || '-'
        }
      }, {
        title: '所属大学',
        dataIndex: 'school.name',
        render: (name, record) => {
          let { school: { id } } = record
          return id === 0 ? '其他' : `${name || '-'}`
        }
      }, {
        title: '服务地点',
        dataIndex: 'school.address',
        render: (address) => {
          return `${address || '-'}`
        }
      }, {
        title: '操作',
        render: (record) => {
          let { location: { pathname } } = this.props
          pathname = pathname.split('/')[1]
          return <span>
            <Link to={`/${pathname}/business/device/address/edit/${record.id}?fromDevice=${this.isFromDeviceView}`}>修改</Link>
          </span>
        }
      }
    ]
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    let search = _.pick(query, 'schoolId', 'addressName')
    let pagination = _.pick(query, 'limit', 'offset')
    this.isFromDeviceView = query.fromDevice === 'true'
    this.getList({ search, pagination })
  }
  initialListData(options) {
    let { loading, list } = this.state
    let search = options.search || {}
    let pagination = options.pagination || {}
    search = { ...this.state.search, ...search }
    pagination = { ...this.state.pagination, ...pagination }
    if (loading) {
      return
    }
    this.setState({ loading: true, search, pagination })

    let activeList = _.filter(this.serviceAddresses, (address) => {
      let matchCurrentAddress = _.find(search.addressName.split(','), (name) => {
        return !!~(address.school.address).indexOf(name)
      })
      let isSelectSchool = search.schoolId !== ''
      let isMatch = !_.isEmpty(matchCurrentAddress)
      if (isSelectSchool && search.addressName) {
        return address.school.id === +search.schoolId && isMatch
      }
      if (isSelectSchool) {
        return address.school.id === +search.schoolId
      }
      if(search.addressName) {
        return isMatch
      }
      return true
    })

    this.setState({
      loading: false,
      list: activeList,
      pagination: {
        ...pagination,
        total: activeList.length
      }
    })
  }
  getList({...options}) {
    let { loading } = this.state
    let search = options.search || {}
    let pagination = options.pagination || {}
    search = { ...this.state.search, ...search }
    pagination = { ...this.state.pagination, ...pagination }
    if (loading) {
      return
    }
    this.setState({ loading: true, search, pagination })

    DeviceAddressService.list().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects, pagination: { total } } } = res
      let schools = [], addresses = {}
      _.chain(objects).reject((address) => {
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
      }).value()
      this.serviceAddresses = objects || []
      let activeList = _.filter(objects || [], (address) => {
        let matchCurrentAddress = _.find(search.addressName.split(','), (name) => {
          return !!~(address.school.address).indexOf(name)
        })

        let isSelectSchool = search.schoolId !== ''
        let isMatch = !_.isEmpty(matchCurrentAddress)
        if (isSelectSchool && search.addressName) {
          return address.school.id === +search.schoolId && isMatch
        }
        if (isSelectSchool) {
          return address.school.id === +search.schoolId
        }
        if(search.addressName) {
          return isMatch
        }
        return true
      })
      this.setState({
        list: activeList || [],
        schools: _.isEmpty(addresses) ? schools : [...schools, addresses],
        pagination: {
          ...pagination,
          total: activeList.length
        },
        loading: false
      })
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  // cancel(id) {
  //   let { loading } = this.state
  //   if (loading) {
  //     return
  //   }
  //   confirm({
  //     title: '删除该服务地点，设备对应的地点信息将被清空，确认删除吗?',
  //     onOk: () =>{
  //       DeviceAddressService.cancel(id).then((res) => {
  //         if (res.status !== 'OK') {
  //           throw new Error(res.message)
  //         }
  //         this.list()
  //       }).catch((err) => {
  //         message.error(err.message || '服务器异常，刷新重试')
  //       })
  //     }
  //   })
  // }
  changeHistory(options) {
    let { location: { pathname } } = this.props
    pathname = pathname.split('/')[1]
    let query = _.pick({...this.state.search, ...this.state.pagination, ...this.state, ...options}, 'schoolId', 'addressName',  'limit', 'offset')
    this.props.history.push(`/${pathname}/business/device/address?${querystring.stringify(query)}`)
  }
  search() {
    let pagination = { offset: 0 }
    this.changeHistory(pagination)
    this.initialListData({ pagination })
  }
  changeAddress(value) {
    let { search } = this.state
    this.setState({ search: { ...search, addressName: value.join(',') } })
  }
  changeSchool(value) {
    let { search } = this.state
    this.setState({ search: { ...search, schoolId: value, addressName: '' } })
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
    this.initialListData({ pagination: { limit: pageSize, offset: offset } })
  }
  render() {
    let { list, loading, search: { addressName, schoolId }, schools } = this.state
    let activeSchoolsMap = _.findWhere(schools, { id: schoolId === '' ? '' : +schoolId }) || {}
    let { location: { pathname } } = this.props
    pathname = pathname.split('/')[1]

    return (<div>
      <Breadcrumb items={this.isFromDeviceView ? deviceBreadItems : breadItems} location={this.props.location} />
      <div>
        <Select
          showSearch
          style={{ width: 240, marginRight: 10 }}
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
          mode="tags"
          value={!!addressName ? addressName.split(',') : []}
          placeholder='请输入服务地点'
          onChange={this.changeAddress.bind(this)}
          onPressEnter={this.search.bind(this)}
          style={{ width: 180, marginRight: 10 }}
        >
          {(activeSchoolsMap.objects || []).map((item) => {
            return <Option key={item.id} value={item.school.address}>{item.school.address}</Option>
          })}
        </Select>
        <Button type='primary'
        style={{ marginRight: 10, marginBottom: 10 }}
        disabled={loading}
        onClick={this.search.bind(this)}>筛选</Button>
        <Button
          type='primary'　
          style={{ marginRight: 10, marginBottom: 10 }}
          onClick={() => { this.props.history.push(`/${pathname}/business/device/address/add?fromDevice=${this.isFromDeviceView}`) }}>新增地点</Button>
      </div>
      <Table
        scroll={{ x: 980 }}
        style= {{ marginTop: 16 }}
        columns={this.columns}
        rowKey={record => record.id}
        dataSource={list}
        pagination={this.pagination()}
        onChange={this.handleTableChange.bind(this)}
        loading={loading}
        bordered
      />
    </div>)
  }
}

export default App