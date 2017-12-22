import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm, Select } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import styles from '../../../assets/css/search-bar.pcss'

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
    title: '区'
  }
]
const { Option } = Select

class District extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '行政区划代码', dataIndex: 'id', key: 'id' },
      { title: '省', dataIndex: 'provinceName',key: 'provinceName' },
      { title: '市', dataIndex: 'cityName',key: 'cityName' },
      { title: '区', dataIndex: 'name',key: 'name' },
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
      type: 'district/provinceList'
    })
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    if(url.provinceId && url.cityId) {
      this.props.dispatch({
        type: 'district/cityList',
        payload: {
          data: {
            provinceId: url.provinceId
          },
          attr: 'cityData'
        }
      })
    }
    this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'district/list',
      payload: {
        data: url
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.district.record.id
        const url = transformUrl(location.search)
        let type = 'district/add'

        if(id) {
          type = 'district/update'
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
      type: 'district/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'district/showModal',
      payload: {
        data: record
      }
    })
    if(record.provinceId) {
      this.props.dispatch({
        type: 'district/cityList',
        payload: {
          data: {
            provinceId: record.provinceId
          },
          attr: 'cityDetailData'
        }
      })
    }
  }
  delete = (id) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'district/delete',
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
            cityId: undefined
          }
        }
      })
      if(!value) {
        this.props.dispatch({
          type: 'district/updateData',
          payload: {
            cityData: []
          }
        })
      } else {
        this.props.dispatch({
          type: 'district/cityList',
          payload: {
            data: {
              [type]: value
            },
            attr: 'cityData'
          }
        })
      }
      delete this.search.cityId
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
    if(value) {
      this.props.dispatch({
        type: 'district/cityList',
        payload: {
          data: {
            provinceId: value
          },
          attr: 'cityDetailData'
        }
      })
    }
    this.props.dispatch({
      type: 'district/updateData',
      payload: {
        cityDetailData: []
      }
    })
    this.props.form.setFieldsValue({
      cityId: undefined,
    })
  }
  reset = () => {
    const { resetFields, getFieldsValue } = this.props.form
    resetFields(Object.keys(getFieldsValue()))
  }
  render() {
    const { common: { search }, form: { getFieldDecorator }, district: { key, visible, record,  data: { objects, pagination }, provinceData, cityData, cityDetailData }, loading  } = this.props
    const title = record.id ? '编辑区' : '添加区'
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
        <Input
          placeholder='请输入区名字关键字'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.name}
         />
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          >
          搜索
        </Button>
        <Button
          type='primary'
          onClick={this.show.bind(this,{})}
          className={styles.button}
          >
          添加区
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
          scroll={{ x: 600 }}
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
              label='区'
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入区名称!',
                }],
                initialValue: record.name
              })(
                <Input placeholder='请输入区名称'/>
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
                  placeholder='市'>
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
          </Form>
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'district/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    common: state.common,
    district: state.district,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(District))
