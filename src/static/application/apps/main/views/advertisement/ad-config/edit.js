import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Select, DatePicker, Col, Upload, Icon, Modal } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import moment from 'moment'

const RangePicker = DatePicker.RangePicker
const { Option } = Select
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const breadItems = [
  {
    title: '业务配置系统'
  },
  {
    title: '广告配置',
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
    this.props.dispatch({ type: 'adConfig/appList' })
    id !== 'new' && this.props.dispatch({
      type: 'adConfig/detail',
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
        let type = 'adConfig/add'
        if(id !== 'new') {
          type = 'adConfig/update'
        }
        if(values.displayParams) {
          values.displayParams = values.displayParams.replace(/，/g,',')
        }
        values.startedAt = moment(values.time[0]).format('YYYY-MM-DDTHH:mm:ss')
        values.endedAt = moment(values.time[1]).format('YYYY-MM-DDTHH:mm:ss')
        values.appId = Number(values.appId)
        values.displayStrategy = Number(values.displayStrategy)
        values.status = Number(values.status)
        values.locationId = Number(values.locationId)
        values.image = 'http://123321321321'
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
  handlePreview = (file) => {
    this.props.dispatch({
      type: 'adConfig/showModal',
      payload: {
        previewImage: file.url || file.thumbUrl
      }
    })
  }
  handleChange = ({fileList, event}) => {
    this.props.dispatch({
      type: 'adConfig/updateData',
      payload: {
        fileList: fileList
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'adConfig/hideModal'
    })
  }
  beforeUpload = (file, fileList) => {
    // if( file.size/1000 > 200 ) {
    //   this.props.dispatch({
    //     type: 'adConfig/updateData',
    //     payload: {
    //       help: {
    //         validateStatus: 'error',
    //         help: '请上传200k以内的图片'
    //       }
    //     }
    //   })
    //   return false
    // } else {
    //   this.props.dispatch({
    //     type: 'adConfig/updateData',
    //     payload: {
    //       help: {
    //         validateStatus: '',
    //         help: ''
    //       }
    //     }
    //   })
    // }
  }
  onRemove = () => {
    // this.props.dispatch({
    //   type: 'adConfig/updateData',
    //   payload: {
    //     help: {
    //       validateStatus: 'success',
    //       help: '图片上传成功'
    //     }
    //   }
    // })
  }
  successHandler = () => {
    Message.success('图片上传成功')
  }
  errorHandler = () => {
    Message.error('图片上传失败,请重新尝试')
    this.props.dispatch({
      type: 'adConfig/updateData',
      payload: {
        fileList: []
      }
    })
  }
  handleAppChange = (value) => {
    this.props.dispatch({
      type: 'adConfig/postionList',
      payload: {
        data: {
          app_id: value
        }
      }
    })
    this.props.dispatch({ type: 'adConfig/deleteLocation' })
    this.props.form.setFieldsValue({
      locationId: undefined,
    })
  }
  selectHandler = (type, value) => {
    this.props.dispatch({
      type: 'adConfig/updateData',
      payload: {
        [type]: value
      }
    })
  }
  render() {
    const { adConfig: { detail, appData, postionData, displayStrategy, help, visible, previewImage, fileList  }, form: { getFieldDecorator, getFieldProps }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    )
    const { startedAt, endedAt } = detail
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
                required: true, message: '请选择业务！',
              }],
              initialValue: detail.appId !== undefined ? detail.appId + '' : undefined
            })(
              <Select
                placeholder='请选择业务'
                onChange={this.handleAppChange}>
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
            label='广告位'
          >
            {getFieldDecorator('locationId', {
              rules: [{
                required: true, message: '请选择广告位！',
              }],
              initialValue: detail.locationId !== undefined ? detail.locationId + '' : undefined
            })(
              <Select
                placeholder='广告位'>
                {
                  postionData.map(value => {
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
            label='广告名'
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入20字以内的广告名！',
              }],
              initialValue: detail.name
            })(
              <Input placeholder='广告名'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='广告标题'
          >
            {getFieldDecorator('title', {
              rules: [{
                required: true, message: '请输入20字以内的广告标题！',
              }],
              initialValue: detail.title
            })(
              <Input placeholder='广告标题'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='上传图片'
            required
            {...help}
          >
             <Upload
               action="//jsonplaceholder.typicode.com/posts/"
               listType="picture-card"
               fileList={fileList}
               onPreview={this.handlePreview}
               onChange={this.handleChange}
               beforeUpload={this.beforeUpload}
               onRemove={this.onRemove}
               onSuccess={this.successHandler}
               onError={this.errorHandler}
             >
               {fileList.length == 1 ? null : uploadButton}
             </Upload>
             <Modal visible={visible} footer={null} onCancel={this.hide}>
               <img alt="example" style={{ width: '100%' }} src={previewImage} />
             </Modal>
           </FormItem>
          <FormItem
            {...formItemLayout}
            label='跳转链接'
          >
            {getFieldDecorator('url', {
              rules: [{
                required: true, message: '请输入广告跳转链接，以http://或https://开头!',
              }],
              initialValue: detail.url
            })(
              <Input placeholder='跳转链接'/>
            )}
          </FormItem>
          <FormItem
             label='展示时间'
             {...formItemLayout}
             required
           >
            {getFieldDecorator('time', {
              rules: [{
                type: 'array', required: true, message: '请选择时间!'
              }],
              initialValue: (startedAt && endedAt) ? [ moment(startedAt, dateFormat), moment(endedAt, dateFormat) ]: undefined
            })(
              <RangePicker showTime format={dateFormat}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='展示状态'
          >
            {getFieldDecorator('displayStrategy', {
              rules: [{
                required: true, message: '请选择展示状态！',
              }],
              initialValue: detail.displayStrategy !== undefined ? detail.displayStrategy + '' : undefined
            })(
              <Select
                placeholder='请选择展示状态'
                onChange={this.selectHandler.bind(this, 'displayStrategy')}>
                  <Option value={'1'}>全部显示</Option>
                  <Option value={'2'}>按尾号显示</Option>
              </Select>
            )}
          </FormItem>
          {
            (displayStrategy === '2' || detail.displayStrategy == 2) ? (
              <FormItem
                {...formItemLayout}
                label='用户号码尾号'
              >
                {getFieldDecorator('displayParams', {
                  rules: [{
                    required: true, message: '请输入用户号码尾号!',
                  }],
                  initialValue: detail.displayParams
                })(
                  <Input placeholder='用户号码尾号'/>
                )}
              </FormItem>
            ) : null
          }
          <FormItem
            {...formItemLayout}
            label='上下架'
          >
            {getFieldDecorator('status', {
              rules: [{
                required: true, message: '请选择上下架！',
              }],
              initialValue: detail.status !== undefined ? detail.status + '' : undefined
            })(
              <Select placeholder='请选择上下架'>
                  <Option value={'1'}>下架</Option>
                  <Option value={'2'}>上架</Option>
              </Select>
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
    adConfig: state.adConfig,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(PlatformEdit))
