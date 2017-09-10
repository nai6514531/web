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
    title: '学校'
  }
]
const { Option } = Select

class School extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '省', dataIndex: 'provinceName',key: 'provinceName' },
      { title: '市', dataIndex: 'cityName',key: 'cityName' },
      { title: '区', dataIndex: 'areaName',key: 'areaName' },
      { title: '学校', dataIndex: 'name',key: 'name' },
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
      type: 'school/provinceList'
    })
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    if(url.cityCode) {
      this.props.dispatch({
        type: 'school/cityList',
        payload: {
          data: {
            provinceCode: url.provinceCode
          },
          attr: 'cityData'
        }
      })
    }
    if(url.areaCode) {
      this.props.dispatch({
        type: 'school/areaList',
        payload: {
          data: {
            cityCode: url.cityCode
          },
          attr: 'areaData'
        }
      })
    }
    this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'school/list',
      payload: {
        data: url
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.school.record.id
        const url = transformUrl(location.search)
        let type = 'school/add'
        if(id) {
          type = 'school/update'
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
      type: 'school/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'school/showModal',
      payload: {
        data: record
      }
    })
    if(record.provinceCode) {
      this.props.dispatch({
        type: 'school/cityList',
        payload: {
          data: {
            provinceCode: record.provinceCode
          },
          attr: 'cityDetailData'
        }
      })
    }
    if(record.cityCode) {
      this.props.dispatch({
        type: 'school/areaList',
        payload: {
          data: {
            cityCode: record.cityCode
          },
          attr: 'areaDetailData'
        }
      })
    }
  }
  delete = (id) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'school/delete',
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
            cityCode: undefined,
            areaCode: undefined
          }
        }
      })
      if(!value) {
        this.props.dispatch({
          type: 'school/updateData',
          payload: {
            cityData: [],
            areaData: []
          }
        })
        delete this.search.cityCode
        delete this.search.areaCode
      } else {
        this.props.dispatch({
          type: 'school/cityList',
          payload: {
            data: {
              [type]: value
            },
            attr: 'cityData'
          }
        })
      }
    }
    if(type === 'cityCode') {
      this.props.dispatch({
        type: 'common/updateSearch',
        payload: {
          search: {
            areaCode: undefined
          }
        }
      })
      if(!value) {
        this.props.dispatch({
          type: 'school/updateData',
          payload: {
            areaData: []
          }
        })
        delete this.search.cityCode
        delete this.search.areaCode
      } else {
        this.props.dispatch({
          type: 'school/areaList',
          payload: {
            data: {
              [type]: value
            },
            attr: 'areaData'
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
    this.props.form.setFieldsValue({
      cityCode: undefined,
      areaCode: undefined
    })
    this.props.dispatch({
      type: 'school/updateData',
      payload: {
        cityDetailData: [],
        areaDetailData: []
      }
    })
    if(value) {
      this.props.dispatch({
        type: 'school/cityList',
        payload: {
          data: {
            provinceCode: value
          },
          attr: 'cityDetailData'
        }
      })
    }
  }
  handleCity = (value) => {
    this.props.form.setFieldsValue({
      areaCode: undefined
    })
    this.props.dispatch({
      type: 'school/updateData',
      payload: {
        areaDetailData: []
      }
    })
    if(value) {
      this.props.dispatch({
        type: 'school/areaList',
        payload: {
          data: {
            cityCode: value
          },
          attr: 'areaDetailData'
        }
      })
    }
  }
  render() {
    const { common: { search }, form: { getFieldDecorator }, school: { key, visible, record,  data: { objects, pagination }, provinceData, cityData, cityDetailData, areaData, areaDetailData }, loading  } = this.props
    const title = record.id ? '编辑学校' : '添加学校'
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
        <Select
          value={ search.areaCode }
          allowClear
          className={styles.input}
          placeholder='区'
          onChange={this.selectHandler.bind('this','areaCode')}>
            {
              areaData.map(value => {
                return (
                  <Option value={value.code} key={value.id}>{value.name}</Option>
                )
              })
            }
        </Select>
        <Input
          placeholder='请输入学校名'
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
            添加学校
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
              label='学校'
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入学校名称',
                }],
                initialValue: record.name
              })(
                <Input placeholder='请输入学校名称'/>
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
                initialValue: record.cityCode !== undefined ? record.cityCode : undefined
              })(
                <Select
                  allowClear
                  placeholder='市'
                  onChange={this.handleCity}>
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
            <FormItem
              {...formItemLayout}
              label='区'
            >
              {getFieldDecorator('areaCode', {
                initialValue: record.areaCode !== undefined ? record.areaCode : undefined
              })(
                <Select
                  allowClear
                  placeholder='区'>
                    {
                      areaDetailData.map(value => {
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
    this.props.dispatch({ type: 'school/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    common: state.common,
    school: state.school,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(School))
