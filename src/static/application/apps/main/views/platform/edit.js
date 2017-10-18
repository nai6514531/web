import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Form, Input, Button } from 'antd'
import DataTable from '../../components/data-table/'
import Breadcrumb from '../../components/layout/breadcrumb/'
import { trim } from 'lodash'

const FormItem = Form.Item
const breadItems = [
  {
    title: '平台管理'
  },
  {
    title: '应用管理',
    url: '/platform/business'
  },
  {
    title: '编辑'
  }
]

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

class PlatformEdit extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const { match: { params: { id } } } = this.props
    id !== 'new' && this.props.dispatch({
      type: 'platform/detail',
      payload: {
        id: id
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history } = this.props
        let type = 'platform/add'
        if(id !== 'new') {
          type = 'platform/update'
        }
        values.name = trim(values.name)
        values.description = trim(values.description)
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
  trim = ( description, rule, value, callback) => {
    const result = !trim(value)
    if ( result && value != '' ) {
      callback(description)
    } else {
      callback()
    }
  }
  render() {
    const { form: { getFieldDecorator }, match: { params: { id } }, platform: { detail }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    return(
      <Spin spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label='应用名'
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入10个字符以内应用名',
              },{
                max: 10, message: '长度最多10个字符'
              },{
                validator: this.trim.bind(this,'请输入10个字符以内应用名' ),
              }],
              initialValue: detail.name
            })(
              <Input placeholder='请输入应用名'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='应用ID'
          >
            {getFieldDecorator('appId', {
              rules: [{
                required: true, message: '请输入应用ID',
              }],
              initialValue: detail.appId
            })(
              <Input placeholder='请输入应用ID'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='应用说明'
          >
            {getFieldDecorator('description', {
              rules: [{
                max: 50, message: '长度最多50个字符'
              }],
              initialValue: detail.description
            })(
              <Input type='textarea' placeholder='请输入应用说明' rows='3'/>
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
}
function mapStateToProps(state,props) {
  return {
    platform: state.platform,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(PlatformEdit))
