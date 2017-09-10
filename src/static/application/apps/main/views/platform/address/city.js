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
    title: '市'
  }
]
const { Option } = Select

class City extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.columns = [
      { title: '行政区划代码', dataIndex: 'code', key: 'code' },
      { title: '省', dataIndex: 'provinceName',key: 'provinceName' },
      { title: '市', dataIndex: 'name',key: 'name' },
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
    this.fetch(url)
    this.props.dispatch({
      type: 'city/provinceList'
    })
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'city/list',
      payload: {
        data: url
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.city.record.id
        const url = transformUrl(location.search)
        let type = 'city/add'
        if(id) {
          type = 'city/update'
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
      type: 'city/hideModal'
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'city/showModal',
      payload: {
        data: record
      }
    })
  }
  delete = (id) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'city/delete',
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
  render() {
    const { common: { search }, form: { getFieldDecorator }, city: { key, visible, record,  data: { objects, pagination }, provinceData }, loading  } = this.props
    const title = record.id ? '编辑市' : '添加市'
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
        <Input
          placeholder='请输入城市名字关键字'
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
            添加市
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
              label='市'
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入市名称!',
                }],
                initialValue: record.name
              })(
                <Input placeholder='请输入市名称'/>
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
                initialValue: record.provinceCode !== undefined ? record.provinceCode + '' : undefined
              })(
                <Select
                  allowClear
                  placeholder='省'>
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
          </Form>
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'city/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    common: state.common,
    city: state.city,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(City))
