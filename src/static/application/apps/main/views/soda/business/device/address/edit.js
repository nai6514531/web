import React, { Component } from 'react'
import _ from 'underscore'
import querystring from 'querystring'
import clone from 'clone'
import QRCode from 'qrcode.react'
import trim from 'trim'

import { Modal, Button, Form, Icon, Spin, Radio, Select, Input, Row, Col, message } from 'antd'
const { Group: RadioGroup } = Radio
const { Option } = Select
const { TextArea } = Input
const { Item: FormItem, create: createForm } = Form
const { confirm } = Modal

import DeviceAddressService from '../../../../../services/soda-manager/device-service-address'
import AddressService from '../../../../../services/soda-manager/address'
import Breadcrumb from '../../../../../components/layout/breadcrumb'

import styles from '../index.pcss'

const breadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '地点管理',
    url:'/soda/business/device/address'
  },
  {
    title: '新增地点'
  }
]

const editBreadItems = [
  {
    title: '苏打生活'
  },
  {
    title: '设备管理',
    url: '/soda/business/device'
  },
  {
    title: '地点管理',
    url:'/soda/business/device/address?fromDevice=true'
  },
  {
    title: '修改地点'
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
    title: '地点管理',
    url:'/soda/business/device/address?fromDevice=true'
  },
  {
    title: '新增地点'
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
      detail: {
        id: 0,
        school: {
          id: '',
          city: {
            id: 0,
          },
          province: {
            id: 0
          },
          address: ''
        }
      },
      provinces: [],
      cities:[
      ],
      schools: [
      ],
      addresses: [
      ],
      loading: false,
      activeAddress: [{
        id: 'address-0',
        address: ''
      }],
      activeProviceId: 0,
      activeCityId: 0,
    }
    this.isAdd = false,
    this.addAddressCount = 0
  }
  componentWillMount() {
    let query = this.props.location.search ? this.props.location.search.slice(1) : ''
    query = querystring.parse(query)
    this.isFromDeviceView = query.fromDevice === 'true'
    let path = this.props.location.pathname
    let { id } = this.props.match.params

    this.isAdd = !~path.indexOf('edit')
    this.getProvinces()
    if (!this.isAdd) {
      return this.getDetail(id)
    }
  }
  getDetail(id) {
    let { activeAddress } = this.state
    this.setState({ loading: true })

    DeviceAddressService.detail(id).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data } = res
      let { school: { province: { id: provinceId }, city: { id: cityId }, id: schoolId, address }, id } = data
      this.setState({
        detail: data,
        loading: false,
        activeAddress: [{
          id: id,
          address: address
        }],
        activeCityId: cityId,
        activeProviceId: provinceId
      })
      this.getCityByProvinceId(provinceId)
      this.getSchoolByCityId(cityId)
    }).catch((err) => {
      this.setState({ loading: false })
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  changeProvince(id) {
    let { form: { setFieldsValue } } = this.props
    id = parseInt(id, 10) || 0
    
    this.setState({ activeProviceId: id })
    this.getCityByProvinceId(id)
    setFieldsValue({ cityId: "", schoolId: "" })

    // if (school.province.id === id) {
    //   setFieldsValue({ schoolId: school.id })
    // } else {
    //   setFieldsValue({ schoolId: "" })
    // }
  }
  changeCity(id) {
    let { form: { setFieldsValue } } = this.props
    id = parseInt(id, 10) || 0
    
    this.setState({ activeCityId: id })
    this.getSchoolByCityId(id)
    setFieldsValue({ schoolId: "" })
  }
  getProvinces() {
    AddressService.provinceList().then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res
      this.setState({
        provinces: _.sortBy(objects, 'id')
      })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getCityByProvinceId(id) {
    let { cities } = this.state
    let keys = _.chain(cities).indexBy('provinceId').keys().value()

    // 当前省对应有对应城市，或 ID 无效
    if (!!~keys.indexOf(String(id)) || !id) {
      return
    }
    AddressService.cityList({ provinceId: id }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res
      this.setState({
        cities: cities.concat({ provinceId: id, objects: _.sortBy(objects, 'id') })
      })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getSchoolByCityId(id) {
    let { schools } = this.state
    let keys = _.chain(schools).indexBy('cityId').keys().value()

    // 当前省对应有对应学校，或 ID 无效
    if (!!~keys.indexOf(String(id)) || !id) {
      return
    }
    AddressService.schoolList({ cityId: id }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data: { objects } } = res
      this.setState({
        schools: schools.concat({ cityId: id, objects: _.sortBy(objects, 'id') })
      })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  getAddressBySchoolId(id) {
    let { addresses } = this.state
    let keys = _.chain(addresses).indexBy('schoolId').keys().value()

    // 当前学校对应有对应服务地点，或 ID 无效
    if (!!~keys.indexOf(String(id)) || !id) {
      return
    }
    DeviceAddressService.list({ schoolId: id }).then((res) => {
      if (res.status !== 'OK') {
        throw new Error(res.message)
      }
      let { data } = res
      this.setState({
        addresses: addresses.concat({ schoolId: id, objects: data.objects })
      })
    }).catch((err) => {
      message.error(err.message || '服务器异常，刷新重试')
    })
  }
  handleSubmit() {
    let { form: { validateFields } } = this.props
    let { device, activeAddress, loading } = this.state
    let isAdd = this.isAdd

    validateFields((errors, value) => {
      if (errors || loading) {
        return
      }

      let options = {
        id: parseInt(value.schoolId, 10) || 0,
        city: {
          id: parseInt(value.cityId, 10) || 0
        },
        province: {
          id: parseInt(value.provinceId, 10) || 0
        }
      }
      let addresses = _.chain(activeAddress || []).map((item) => {
        return value[item.id]
      }).union().value()
      
      if (isAdd) {
        if (activeAddress.length !== addresses.length) {
          return message.error('新增服务地点重复,请修改后再提交')
        }
        return this.addAddress({ school: { ...options, addresses: addresses }})
      }
      this.updateAddress({ school: { ...options, address: addresses[0] }})
    })
  }
  addAddress(options) {
    this.setState({ loading: true })

    DeviceAddressService.add(options).then((res) => {
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
  updateAddress(options) {
    let { id } = this.props.match.params
    this.setState({ loading: true })

    DeviceAddressService.update({ id: +id, ...options }).then((res) => {
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
  addActiveAddress() {
    let { activeAddress } = this.state
    let count = ++this.addAddressCount

    this.setState({ 
      activeAddress: [...activeAddress, {
        id: `address-${count}`,
        address: ''
      }]
    })
  }
  cancelActiveAddress(id) {
    let { activeAddress } = this.state
    activeAddress = _.reject(activeAddress, (address) => {
      return address.id === id
    })
    this.setState({ activeAddress: activeAddress })
  }
  cancel() {
    confirm({
      title: `确定取消?`,
      onOk: () => {
        return this.props.history.go(-1)
      }
    });
  }
  render() {
    let { form: { getFieldDecorator } } = this.props
    let { 
      loading, provinces, cities, schools, activeProviceId, activeCityId, activeAddress,
      detail: { school: { city: { id: cityId }, province: { id: provinceId }, id: schoolId, address } } 
    } = this.state
    let isAdd = this.isAdd
    cities = _.findWhere(cities, { provinceId: activeProviceId }) || {}
    schools = _.findWhere(schools, { cityId: activeCityId }) || {}
    
    return (<div>
      <Breadcrumb items={!this.isFromDeviceView ? breadItems : isAdd ? addBreadItems : editBreadItems} />
      <Spin spinning={loading}>
        <Form>
          <FormItem
            {...formItemLayout}
            label="省份">
            {getFieldDecorator('provinceId', {
              rules: [
                {required: true, message: '必填'},
              ],
              initialValue: provinceId === 0 ? '' : provinceId 
            })(
              <Select
                showSearch
                optionFilterProp="children"
                placeholder="请选择省份"
                notFoundContent="搜索无结果"
                onChange={this.changeProvince.bind(this)}>
                  <Option value="">请选择省份</Option>
                  { 
                    (provinces || []).map((province) => {
                      return <Option key={province.id} value={province.id}>{province.name}</Option>
                    })
                  }
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="城市">
            {getFieldDecorator('cityId', {
              rules: [
                {required: true, message: '必填'},
              ],
              initialValue: _.isEmpty(cities.objects) || cityId === 0 ? '' : cityId
            })(
              <Select
                showSearch
                optionFilterProp="children"
                placeholder="请选择城市"
                notFoundContent="搜索无结果"
                onChange={this.changeCity.bind(this)}>
                  <Option value="">请选择城市</Option>
                  { 
                    (cities.objects || []).map((city) => {
                      return <Option key={city.id} value={city.id}>{city.name}</Option>
                    })
                  }
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="学校">
            {getFieldDecorator('schoolId', {
              rules: [
                {required: true, message: '必填'},
              ],
              initialValue: _.isEmpty(schools) && schoolId !== 0  ? '' : schoolId
            })(
              <Select
                showSearch
                optionFilterProp="children"
                placeholder='请选择学校(非学校服务选"其他")'
                notFoundContent="搜索无结果">
                  <Option value="">请选择学校(非学校服务选"其他")</Option>
                  { 
                    (schools.objects || []).map((school) => {
                      return <Option key={school.id} value={school.id}>{school.name}</Option>
                    })
                  }
                  <Option value={0}>其他</Option>
              </Select>
            )}
          </FormItem>
          { (activeAddress || []).map((address, index) => {
              let itemLayout = index === 0 ? formItemLayout : tailFormItemLayout
              return <FormItem
                key={index}
                { ...itemLayout }
                label={ index === 0 ? '服务地点' : ''}>
                <Row>
                  <Col span={index === 0 ? 24 : 20}>
                    {getFieldDecorator(`${address.id}`, {
                      rules: [
                        {required: true, message: '必填'},
                        { max:30, message: '不超过三十个字' },
                      ],
                      normalize: trim,
                      initialValue: address.address,
                    })(
                      <Input placeholder="请输入服务地点" />
                    )}
                  </Col>
                  { isAdd && index !== 0 ? <Col span={3} offset={1}> <a onClick={this.cancelActiveAddress.bind(this, address.id)}>删除</a></Col> : null }
                </Row>
                </FormItem>
            }) 
          }
          {
            isAdd ? <FormItem {...tailFormItemLayout}>
              <Button style={{ width: '100%' }} type="dashed" icon="plus" onClick={this.addActiveAddress.bind(this)}>新增服务地点</Button>
            </FormItem> : null
          }
          <FormItem {...tailFormItemLayout}>
            <Button style={{ marginRight: 10 }} type="ghost" onClick={this.cancel.bind(this)}>取消</Button>
            <Button type="primary" onClick={this.handleSubmit.bind(this)}>保存</Button>
          </FormItem>
        </Form>
      </Spin>
    </div>)
  }
}

export default createForm()(Edit)