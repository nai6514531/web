import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Select, DatePicker, Col, Upload, Icon, Modal } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../../utils/debug.js'
import { trim } from 'lodash'
import moment from 'moment'

const RangePicker = DatePicker.RangePicker
const { Option } = Select
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
}

class SupplierEdit extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const { match: { params: { id } } } = this.props
    id !== 'new' && this.props.dispatch({
      type: 'supplier/detail',
      payload: {
        id: id
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history } = this.props
        let type = 'supplier/add'
        if(id !== 'new') {
          type = 'supplier/update'
        }
        values.name = trim(values.name) 
        values.contact = trim(values.contact) 
        values.telephone = trim(values.telephone)      
        values.address = trim(values.address)    
        values.email = trim(values.email)                    
        values.status = Number(trim(values.status))
        values.bankName = trim(values.bankName)    
        values.bankAccount = trim(values.bankAccount)  
        values.realName = trim(values.realName)            
        values.settleAt = moment(values.settleAt,moment.ISO_8601).format()
        values.remark = trim(values.remark)    
        this.props.dispatch({
          type: type,
          payload: {
            history,
            data: values,
            id: id
          }
        })
      }
    })
  }
  cancelHandler = () => {
    this.props.history.goBack()
  }
  
  hide = () => {
    this.props.dispatch({
      type: 'supplier/hideModal'
    })
  }
  trim = ( description, rule, value, callback) => {
    const result = !trim(value)
    if ( result && value != '' ) {
      callback(description)
    } else {
      callback()
    }
  }
  render() {
    const { supplier: { detail }, form: { getFieldDecorator, getFieldProps }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    const { settleAt } = detail    
    const breadItems = [
      {
        title: '供应商管理'
      },
      {
        title: '新增/编辑供应商',
        url: '/game/supplier'
      },
      {
        title: isEdit ? '编辑' : '添加'
      }
    ]
    return(
      <Spin spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
            <FormItem
                {...formItemLayout}
                label='供应商名称'
            >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入20字以内的供应商名',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.name
            })(
                isEdit ?
              <Input placeholder='请输入供应商名' readOnly />:
              <Input placeholder='请输入供应商名' />              
            )}
          </FormItem>
          { isEdit ? <FormItem
                {...formItemLayout}
                label='供应商Id'
            >
            {getFieldDecorator('id', {
              initialValue: detail.id
            })(
              <Input  readOnly />
            )}
          </FormItem>:''}
          <FormItem
                {...formItemLayout}
                label='联系人'
            >
            {getFieldDecorator('contact', {
              rules: [{
                 message: '请输入20字以内的联系人姓名',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.contact
            })(
              <Input placeholder='请输入联系人姓名'/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='联系电话'
            >
            {getFieldDecorator('telephone', {
              rules: [{
                message: '请输入20字以内的联系电话',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.telephone
            })(
              <Input placeholder='请输入联系人电话'/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='联系地址'
            >
            {getFieldDecorator('address', {
              rules: [{
                message: '请输入20字以内的联系地址',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.address
            })(
              <Input placeholder='请输入供应商联系地址'/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='邮箱'
            >
            {getFieldDecorator('email', {
              rules: [{
                message: '请输入20字以内的邮箱',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.email
            })(
              <Input placeholder='请输入联系人邮箱'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='供应商状态'
          >
            {getFieldDecorator('status', {
              rules: [{
                message: '请选择供应商状态',
              }],
              initialValue: detail.status !== undefined ? detail.status + '' : '0'
            })(
              <Select placeholder='请选择供应商状态'>
                <Option value={'0'}>正常</Option>
                <Option value={'1'}>禁用</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='开户银行'
            >
            {getFieldDecorator('bankName', {
              rules: [{
                message: '请输入20字以内的开户银行',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.bankName
            })(
              <Input placeholder='请输入供应商开户银行'/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='银行账号'
            >
            {getFieldDecorator('bankAccount', {
              rules: [{
                message: '请输入20字以内的银行账号',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.bankAccount
            })(
              <Input placeholder='请输入银行结算账号'/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='银行账户名'
            >
            {getFieldDecorator('realName', {
              rules: [{
                message: '请输入20字以内的银行账户名',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.realName
            })(
              <Input placeholder='请输入银行结算账户名'/>
            )}
          </FormItem>

          <FormItem
             label='结算日期'
             {...formItemLayout}
           >
            {getFieldDecorator('settleAt', {
              rules: [{ type: 'object'}],
              initialValue: settleAt ? moment(settleAt, dateFormat) : undefined
            })(

            <DatePicker
                showTime
                format={dateFormat}
                placeholder="选择时间"
              />
            )}
          </FormItem>

          <FormItem
                {...formItemLayout}
                label='备注'
            >
            {getFieldDecorator('remark', {
              rules: [{
                message: '请输入50字以内的备注',
              },{
                max: 50, message: '长度最多50个字符'
              }],
              initialValue: detail.remark
            })(
              <Input type="textarea" placeholder='请输入备注'/>
            )}
          </FormItem>

          <FormItem style={{textAlign: 'center'}}>
            <Button
              style={{margin: '20px 50px 0 0'}}
              loading={loading}
              onClick={this.cancelHandler}>
              取消
            </Button>
            <Button
              type='primary'
              loading={loading}
              onClick={this.handleSubmit}>
              保存
            </Button>
          </FormItem>
        </Form>
      </Spin>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'supplier/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    supplier: state.supplier,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(SupplierEdit))
