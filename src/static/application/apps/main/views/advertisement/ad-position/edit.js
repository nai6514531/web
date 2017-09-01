import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Form, Input, Button, Select } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'

const { Option } = Select
const FormItem = Form.Item
const breadItems = [
  {
    title: '业务配置系统'
  },
  {
    title: '广告位管理',
    url: ''
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
    if( id !== 'new' ) {
      this.props.dispatch({
        type: 'adPosition/detail',
        payload: {
          id: id
        }
      })
    } else {
      this.props.dispatch({
        type: 'adPosition/appList',
        payload: {
          id: id
        }
      })
    }
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history } = this.props
        let type = 'adPosition/add'
        if(id !== 'new') {
          type = 'adPosition/update'
        }
        values.appId = Number(values.appId)
        values.identifyNeeded = Number(values.identifyNeeded)
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
  render() {
    const { form: { getFieldDecorator }, match: { params: { id } }, adPosition : { detail, appData }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    return(
      <Spin spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label='所属业务'
          >
            {getFieldDecorator('appId', {
              rules: [{
                required: true, message: '请选择所属业务!',
              }],
              initialValue: detail.appId ? detail.appId + '' : detail.appId
            })(
              <Select placeholder="请选择所属业务">
                {
                  appData.map(value => {
                    return (
                      <Option value={value.id + ''} key={value.id}>{value.name}</Option>
                    )
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='广告位名'
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入10个字符以内广告位名！',
              },{
                max: 10, message: '长度最多10个字符！'
              }],
              initialValue: detail.name
            })(
              <Input/>
            )}
          </FormItem>
          { isEdit ? (
            <FormItem
              {...formItemLayout}
              label='广告位ID'
            >
              {getFieldDecorator('id', {
                initialValue: detail.id
              })(
                <Input disabled={true}/>
              )}
            </FormItem>
          ) : null }
          <FormItem
            {...formItemLayout}
            label='登录状态'
          >
            {getFieldDecorator('identifyNeeded', {
              rules: [{
                required: true, message: '请选择登录状态!',
              }],
              initialValue: detail.identifyNeeded !== undefined ? detail.identifyNeeded + '' : detail.identifyNeeded
            })(
              <Select>
                  <Option value={'0'}>否</Option>
                  <Option value={'1'}>是</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='广告位说明'
          >
            {getFieldDecorator('description', {
              rules: [{
                required: true, message: '请输入50字符以内广告位说明！',
              },{
                max: 50, message: '长度最多50个字符！'
              }],
              initialValue: detail.description
            })(
              <Input type="textarea" placeholder="请输入50字符以内的广告位说明" rows='3' />
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
    adPosition: state.adPosition,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(PlatformEdit))
