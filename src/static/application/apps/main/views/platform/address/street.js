import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm, Select } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import styles from './index.pcss'

const FormItem = Form.Item
const formItemLayout = {
   labelCol: {
     xs: { span: 24 },
     sm: { span: 6 },
   },
   wrapperCol: {
     xs: { span: 24 },
     sm: { span: 14 },
   }
}
const breadItems = [
  {
    title: '平台管理'
  },
  {
    title: '地址管理'
  },
  {
    title: '街道'
  }
]
const { Option } = Select

class Street extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '行政区划代码', dataIndex: 'id', key: 'id' },
      { title: '省', dataIndex: 'provinceName',key: 'provinceName' },
      { title: '市', dataIndex: 'cityName',key: 'cityName' },
      { title: '区', dataIndex: 'districtName',key: 'districtName' },
      { title: '街道', dataIndex: 'name',key: 'name' },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>编辑</a> |
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除</a>
              </Popconfirm>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'street/provinceList'
    })
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    if(url.cityId) {
      this.props.dispatch({
        type: 'street/cityList',
        payload: {
          data: {
            provinceId: url.provinceId
          },
          attr: 'cityData'
        }
      })
    }
    if(url.districtId) {
      this.props.dispatch({
        type: 'street/districtList',
        payload: {
          data: {
            cityId: url.cityId
          },
          attr: 'districtData'
        }
      })
    }
    this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'street/list',
      payload: {
        data: url
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.street.record.id
        const url = transformUrl(location.search)
        let type = 'street/add'

        if(id) {
          type = 'street/update'
        }

        values.id = Number(values.id)
        values.provinceId = Number(values.provinceId)
        values.cityId = Number(values.cityId)
        values.districtId = Number(values.districtId)

        this.props.dispatch({
          type: type,
          payload: { data: values, id, url }
        })
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'street/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'street/showModal',
      payload: {
        data: record
      }
    })
    if(record.provinceId) {
      this.props.dispatch({
        type: 'street/cityList',
        payload: {
          data: {
            provinceId: record.provinceId
          },
          attr: 'cityDetailData'
        }
      })
    }
    if(record.cityId) {
      this.props.dispatch({
        type: 'street/districtList',
        payload: {
          data: {
            cityId: record.cityId
          },
          attr: 'districtDetailData'
        }
      })
    }
  }
  delete = (id) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'street/delete',
      payload: {
        id,
        url
      }
    })
  }
  changeHandler =  (type, e) => {
    this.search = { ...this.search, [type]: e.target.value }
  }
  selectHandler =  (type, value) => {
    if(type === 'provinceId') {
      this.props.dispatch({
        type: 'common/updateSearch',
        payload: {
          search: {
            cityId: undefined,
            districtId: undefined
          }
        }
      })
      if(!value) {
        this.props.dispatch({
          type: 'street/updateData',
          payload: {
            cityData: [],
            districtData: []
          }
        })
        delete this.search.cityId
        delete this.search.districtId
      } else {
        this.props.dispatch({
          type: 'street/cityList',
          payload: {
            data: {
              [type]: value
            },
            attr: 'cityData'
          }
        })
      }
    }
    if(type === 'cityId') {
      this.props.dispatch({
        type: 'common/updateSearch',
        payload: {
          search: {
            districtId: undefined
          }
        }
      })
      if(!value) {
        this.props.dispatch({
          type: 'street/updateData',
          payload: {
            districtData: []
          }
        })
        delete this.search.cityId
        delete this.search.districtId
      } else {
        this.props.dispatch({
          type: 'street/districtList',
          payload: {
            data: {
              [type]: value
            },
            attr: 'districtData'
          }
        })
      }
    }
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: {
          [type]: value
        }
      }
    })
    if(value) {
      this.search = { ...this.search, [type]: value }
    } else {
      delete this.search[type]
    }
  }
  searchClick = () => {
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    this.props.history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  change = (url) => {
   this.fetch(url)
  }
  handleProvince = (value) => {
    this.props.form.setFieldsValue({
      cityId: undefined,
      districtId: undefined
    })
    this.props.dispatch({
      type: 'street/updateData',
      payload: {
        cityDetailData: [],
        districtDetailData: []
      }
    })
    if(value) {
      this.props.dispatch({
        type: 'street/cityList',
        payload: {
          data: {
            provinceId: value
          },
          attr: 'cityDetailData'
        }
      })
    }
  }
  handleCity = (value) => {
    this.props.form.setFieldsValue({
      districtId: undefined
    })
    this.props.dispatch({
      type: 'street/updateData',
      payload: {
        districtDetailData: []
      }
    })
    if(value) {
      this.props.dispatch({
        type: 'street/districtList',
        payload: {
          data: {
            cityId: value
          },
          attr: 'districtDetailData'
        }
      })
    }
  }
  reset = () => {
    const { resetFields, getFieldsValue } = this.props.form
    resetFields(Object.keys(getFieldsValue()))
  }
  render() {
    const { common: { search }, form: { getFieldDecorator }, street: { key, visible, record,  data: { objects, pagination }, provinceData, cityData, cityDetailData, districtData, districtDetailData }, loading  } = this.props
    const title = record.id ? '编辑街道' : '添加街道'
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Select
          value={ search.provinceId }
          allowClear
          className={styles.input}
          placeholder='省'
          onChange={this.selectHandler.bind('this','provinceId')}>
            {
              provinceData.map(value => {
                return (
                  <Option value={value.id} key={value.id}>{value.name}</Option>
                )
              })
            }
        </Select>
        <Select
          value={ search.cityId }
          allowClear
          className={styles.input}
          placeholder='市'
          onChange={this.selectHandler.bind('this','cityId')}>
            {
              cityData.map(value => {
                return (
                  <Option value={value.id} key={value.id}>{value.name}</Option>
                )
              })
            }
        </Select>
        <Select
          value={ search.districtId }
          allowClear
          className={styles.input}
          placeholder='区'
          onChange={this.selectHandler.bind('this','districtId')}>
            {
              districtData.map(value => {
                return (
                  <Option value={value.id} key={value.id}>{value.name}</Option>
                )
              })
            }
        </Select>
        <Input
          placeholder='请输入街道名字关键字'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.name}
         />
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            搜索
          </Button>
          <Button
            type='primary'
            onClick={this.show.bind(this,{})}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            添加街道
          </Button>
        </span>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
        <Modal
          title={title}
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          afterClose={this.reset}
         >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label='街道'
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入街道名称!',
                }],
                initialValue: record.name
              })(
                <Input placeholder='请输入街道名称'/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='行政区划代码'
            >
              {getFieldDecorator('id', {
                rules: [{
                  required: true, message: '请输入行政区划代码!',
                }],
                initialValue: record.id
              })(
                <Input placeholder='请输入行政区划代码'/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='省'
            >
              {getFieldDecorator('provinceId', {
                rules: [{
                  required: true, message: '请选择省',
                }],
                initialValue: record.provinceId !== undefined ? record.provinceId : undefined
              })(
                <Select
                  allowClear
                  placeholder='省'
                  onChange={this.handleProvince}>
                    {
                      provinceData.map(value => {
                        return (
                          <Option value={value.id} key={value.id}>{value.name}</Option>
                        )
                      })
                    }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='市'
            >
              {getFieldDecorator('cityId', {
                rules: [{
                  required: true, message: '请选择市',
                }],
                initialValue: record.cityId !== undefined ? record.cityId : undefined
              })(
                <Select
                  allowClear
                  placeholder='市'
                  onChange={this.handleCity}>
                    {
                      cityDetailData.map(value => {
                        return (
                          <Option value={value.id} key={value.id}>{value.name}</Option>
                        )
                      })
                    }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='区'
            >
              {getFieldDecorator('districtId', {
                rules: [{
                  required: true, message: '请选择区',
                }],
                initialValue: record.districtId !== undefined ? record.districtId : undefined
              })(
                <Select
                  allowClear
                  placeholder='区'>
                    {
                      districtDetailData.map(value => {
                        return (
                          <Option value={value.id} key={value.id}>{value.name}</Option>
                        )
                      })
                    }
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'street/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    common: state.common,
    street: state.street,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Street))
