import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Select, DatePicker, Col, Upload, Icon, Modal } from 'antd'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../utils/debug.js'
import { storage } from '../../../utils/storage.js'
import { trim } from 'lodash'
import moment from 'moment'
import './drag.css'

const RangePicker = DatePicker.RangePicker
const { Option } = Select
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const imageUrl = `${API_SERVER}/advertisements/images`
const confirm = Modal.confirm;
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
    this.props.dispatch({ type: 'adConfigDetail/appList' })
    id !== 'new' && this.props.dispatch({
      type: 'adConfigDetail/detail',
      payload: {
        id: id
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history, adConfigDetail: { fileList } } = this.props
        let type = 'adConfigDetail/add'
        if(id !== 'new') {
          type = 'adConfigDetail/update'
        }
        if(values.displayParams) {
          values.displayParams = values.displayParams.replace(/，/g,',')
        }
        if(fileList[0] && fileList[0].image) {
          values.image = fileList[0].image
        } else {
          this.props.dispatch({
            type: 'adConfigDetail/updateData',
            payload: {
              help: {
                validateStatus: 'error',
                help: '请选择图片上传'
              }
            }
          })
          return
        }
        values.startedAt = moment(values.time[0],moment.ISO_8601).format()
        values.endedAt = moment(values.time[1],moment.ISO_8601).format()
        values.appId = Number(values.appId)
        values.displayStrategy = Number(values.displayStrategy)
        values.status = Number(values.status)
        values.adPositionId = Number(values.adPositionId)
        values.name = trim(values.name)
        values.title = trim(values.title)
        values.url = trim(values.url)
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
      type: 'adConfigDetail/showModal',
      payload: {
        previewImage: file.url || file.thumbUrl
      }
    })
  }
  handleChange = ({fileList, event, file}) => {
    fileList = fileList.map((file) => {
      if (file.response) {
        file.image = file.response.data
      }
      return file
    })
    fileList = fileList.filter((file) => {
      if (file.response) {
        if(file.response.status === 'OK') {
          this.props.dispatch({
            type: 'adConfigDetail/updateData',
            payload: {
              help: {
                validateStatus: 'success',
                help: '图片上传成功'
              }
            }
          })
          return file.response.status === 'OK'
        } else {
          this.props.dispatch({
            type: 'adConfigDetail/updateData',
            payload: {
              help: {
                validateStatus: 'error',
                help: '图片上传失败,请重新尝试'
              }
            }
          })
          return false
        }
      }
      return true
    })
    this.props.dispatch({
      type: 'adConfigDetail/updateData',
      payload: {
        fileList: fileList
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'adConfigDetail/hideModal'
    })
  }
  beforeUpload = (file, fileList) => {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    if(!isJPG && !isPNG) {
      Message.error('上传的图片格式错误');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if(!isLt1M) {
      Message.error('图片过大，请压缩后再上传');
    }
    return (isJPG || isPNG) && isLt1M;
  }
  showConfirm = () => {
    confirm({
      title: '是否删除该图片?',
      okText: '确认',
      cancelText: '取消',
      onOk: this.onRemove
    })
    return false
  }
  onRemove = () => {
    this.props.dispatch({
      type: 'adConfigDetail/updateData',
      payload: {
        fileList: []
      }
    })
    this.props.dispatch({
      type: 'adConfigDetail/updateData',
      payload: {
        help: {
          validateStatus: '',
          help: '请上传1M以内的图片'
        }
      }
    })
  }
  handleAppChange = (value) => {
    this.props.dispatch({
      type: 'adConfigDetail/postionList',
      payload: {
        data: {
          appId: value
        }
      }
    })
    this.props.dispatch({ type: 'adConfigDetail/deleteLocation' })
    this.props.form.setFieldsValue({
      adPositionId: undefined,
    })
  }
  selectHandler = (type, value) => {
    if(type === 'adPositionId') {
      this.props.adConfigDetail.postionData.map((item) => {
        if(value == item.id) {
          this.props.dispatch({
            type: 'adConfigDetail/updateData',
            payload: {
              help: {
                validateStatus: '',
                help: item.standard
              },
              identifyNeeded: item.identifyNeeded
            }
          })
        }
      })
      return
    }
    this.props.dispatch({
      type: 'adConfigDetail/updateData',
      payload: {
        [type]: value
      }
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
    const { adConfigDetail: { standard, detail, appData, postionData, displayStrategy, help, visible, previewImage, fileList, identifyNeeded  }, form: { getFieldDecorator, getFieldProps }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    const uploadButton = (
      <div>
        <Icon type='plus' />
        <div className='ant-upload-text'>图片</div>
      </div>
    )
    const displayOption = identifyNeeded === 0 ? <Option value={'1'}>全部显示</Option> : [ <Option value={'1'} key={1}>全部显示</Option>,<Option value={'2'} key={2}>按尾号显示</Option> ]
    const breadItems = [
      {
        title: '业务配置系统'
      },
      {
        title: '广告配置',
        url: '/advertisement/config'
      },
      {
        title: isEdit ? '编辑' : '添加'
      }
    ]
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
                required: true, message: '请选择业务',
              }],
              initialValue: detail.appId !== undefined ? detail.appId + '' : undefined
            })(
              <Select
                disabled={isEdit}
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
            {getFieldDecorator('adPositionId', {
              rules: [{
                required: true, message: '请选择广告位',
              }],
              initialValue: detail.adPositionId !== undefined ? detail.adPositionId + '' : undefined
            })(
              <Select
                disabled={isEdit}
                placeholder='广告位'
                onChange={this.selectHandler.bind(this, 'adPositionId')}>
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
                required: true, message: '请输入20字以内的广告名',
              },{
                max: 20, message: '长度最多20个字符'
              },{
                validator: this.trim.bind(this,'请输入20字以内的广告名'),
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
                required: true, message: '请输入20字以内的广告标题',
              },{
                max: 20, message: '长度最多20个字符'
              },{
                validator: this.trim.bind(this,'请输入20字以内的广告标题'),
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
               action={imageUrl}
               listType='picture-card'
               fileList={fileList}
               onPreview={this.handlePreview}
               onChange={this.handleChange}
               beforeUpload={this.beforeUpload}
               onRemove={this.showConfirm}
               headers={{ Authorization: 'Bearer ' + (storage.val('token') || '') }}
               withCredentials={true}
             >
               {fileList.length == 1 ? null : uploadButton}
             </Upload>
             <Modal visible={visible} footer={null} onCancel={this.hide}>
               <img alt='图片加载失败' style={{ padding: 15, width: '100%' }} src={previewImage} />
             </Modal>
           </FormItem>
          <FormItem
            {...formItemLayout}
            label='跳转链接'
          >
            {getFieldDecorator('url', {
              rules: [{
                required: true, message: '请输入广告跳转链接，以http://或https://开头',
              },{
                max: 255, message: '长度最多255个字符'
              },{
                validator: this.trim.bind(this,'请输入广告跳转链接，以http://或https://开头'),
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
                type: 'array', required: true, message: '请选择时间'
              }],
              initialValue: (startedAt && endedAt) ? [ moment(startedAt, dateFormat), moment(endedAt, dateFormat) ]: undefined
            })(
              <RangePicker
                showTime
                format={dateFormat}
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='展示状态'
          >
            {getFieldDecorator('displayStrategy', {
              rules: [{
                required: true, message: '请选择展示状态',
              }],
              initialValue: detail.displayStrategy !== undefined ? detail.displayStrategy + '' : undefined
            })(
              <Select
                placeholder='请选择展示状态'
                onChange={this.selectHandler.bind(this, 'displayStrategy')}>
                  { displayOption }
              </Select>
            )}
          </FormItem>
          {
            (displayStrategy == 2) ? (
              <FormItem
                {...formItemLayout}
                label='用户号码尾号'
              >
                {getFieldDecorator('displayParams', {
                  rules: [{
                    required: true, message: '请输入用户号码尾号',
                  },{
                    max: 20, message: '长度最多20个字符'
                  },{
                    validator: this.trim.bind(this,'请输入用户号码尾号'),
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
                required: true, message: '请选择上下架',
              }],
              initialValue: detail.status !== undefined ? detail.status + '' : undefined
            })(
              <Select placeholder='请选择上下架'>
                <Option value={'2'}>上架</Option>
                <Option value={'1'}>下架</Option>
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
  componentWillUnmount() {
    this.props.dispatch({ type: 'adConfigDetail/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    adConfigDetail: state.adConfigDetail,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(PlatformEdit))
