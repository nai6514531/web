import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm, Select } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import history from '../../../utils/history.js'
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
    title: '区'
  }
]
const { Option } = Select

class Area extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '行政区划代码', dataIndex: 'code', key: 'code' },
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
      type: 'area/provinceList'
    })
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    if(url.provinceCode && url.cityCode) {
      this.props.dispatch({
        type: 'area/cityList',
        payload: {
          data: {
            provinceCode: url.provinceCode
          },
          attr: 'cityData'
        }
      })
    }
    this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'area/list',
      payload: {
        data: url
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.area.record.id
        const url = transformUrl(location.search)
        let type = 'area/add'
        if(id) {
          type = 'area/update'
        }
        this.props.dispatch({
          type: type,
          payload: { data: values, id, url }
        })
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'area/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'area/showModal',
      payload: {
        data: record
      }
    })
    if(record.provinceCode) {
      this.props.dispatch({
        type: 'area/cityList',
        payload: {
          data: {
            provinceCode: record.provinceCode
          },
          attr: 'cityDetailData'
        }
      })
    }
  }
  delete = (id) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'area/delete',
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
    if(type === 'provinceCode') {
      this.props.dispatch({
        type: 'common/updateSearch',
        payload: {
          search: {
            cityCode: undefined
          }
        }
      })
      if(!value) {
        this.props.dispatch({
          type: 'area/updateData',
          payload: {
            cityData: []
          }
        })
      } else {
        this.props.dispatch({
          type: 'area/cityList',
          payload: {
            data: {
              [type]: value
            },
            attr: 'cityData'
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
    history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  change = (url) => {
   this.fetch(url)
  }
  handleProvince = (value) => {
    if(value) {
      this.props.dispatch({
        type: 'area/cityList',
        payload: {
          data: {
            provinceCode: value
          },
          attr: 'cityDetailData'
        }
      })
    }
    this.props.dispatch({
      type: 'area/updateData',
      payload: {
        cityDetailData: []
      }
    })
    this.props.form.setFieldsValue({
      cityCode: undefined,
    })
  }
  render() {
    const { common: { search }, form: { getFieldDecorator }, area: { key, visible, record,  data: { objects, pagination }, provinceData, cityData, cityDetailData }, loading  } = this.props
    const title = record.id ? '编辑区' : '添加区'
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Select
          value={ search.provinceCode }
          allowClear
          className={styles.input}
          placeholder='省'
          onChange={this.selectHandler.bind('this','provinceCode')}>
            {
              provinceData.map(value => {
                return (
                  <Option value={value.code} key={value.id}>{value.name}</Option>
                )
              })
            }
        </Select>
        <Select
          value={ search.cityCode }
          allowClear
          className={styles.input}
          placeholder='市'
          onChange={this.selectHandler.bind('this','cityCode')}>
            {
              cityData.map(value => {
                return (
                  <Option value={value.code} key={value.id}>{value.name}</Option>
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
            添加区
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
          key={key}
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
              {getFieldDecorator('code', {
                rules: [{
                  required: true, message: '请输入行政区划代码!',
                }],
                initialValue: record.code
              })(
                <Input placeholder='请输入行政区划代码'/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='省'
            >
              {getFieldDecorator('provinceCode', {
                rules: [{
                  required: true, message: '请选择省',
                }],
                initialValue: record.provinceCode !== undefined ? record.provinceCode : undefined
              })(
                <Select
                  allowClear
                  placeholder='省'
                  onChange={this.handleProvince}>
                    {
                      provinceData.map(value => {
                        return (
                          <Option value={value.code} key={value.id}>{value.name}</Option>
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
              {getFieldDecorator('cityCode', {
                rules: [{
                  required: true, message: '请选择市',
                }],
                initialValue: record.cityCode !== undefined ? record.cityCode : undefined
              })(
                <Select
                  allowClear
                  placeholder='市'>
                    {
                      cityDetailData.map(value => {
                        return (
                          <Option value={value.code} key={value.id}>{value.name}</Option>
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
    this.props.dispatch({ type: 'area/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    common: state.common,
    area: state.area,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Area))
