import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Select, DatePicker, Col, Upload, Icon, Modal } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../../constant/api'
import { storage } from '../../../../utils/storage.js'
import { trim } from 'lodash'
import moment from 'moment'

const RangePicker = DatePicker.RangePicker
const { Option } = Select
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const imageServer = `${API_SERVER}/upload/channel`
const confirm = Modal.confirm

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

class ChannelEdit extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const { match: { params: { id } } } = this.props
    this.props.dispatch({ type: 'channelEdit/appList' })
    id !== 'new' && this.props.dispatch({
      type: 'channelEdit/detail',
      payload: {
        id: id
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history, channelEdit: { fileList } } = this.props
        values.type = Number(values.type)
        let type = 'channelEdit/add'
        if(id !== 'new') {
          type = 'channelEdit/update'
        }
        if(values.displayParams) {
          values.displayParams = values.displayParams.replace(/，/g,',')
        }
        if(fileList[0] && fileList[0].image) {
          values.imageUrl = fileList[0].image
        } else {
          this.props.dispatch({
            type: 'channelEdit/updateData',
            payload: {
              help: {
                validateStatus: 'error',
                help: '请选择图片上传'
              }
            }
          })
          return
        }
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
      type: 'channelEdit/showModal',
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
            type: 'channelEdit/updateData',
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
            type: 'channelEdit/updateData',
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
      type: 'channelEdit/updateData',
      payload: {
        fileList: fileList
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'channelEdit/hideModal'
    })
  }
  beforeUpload =  (file, fileList) => {
    const fr = new FileReader
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isLt1M = file.size / 1024 / 1024 < 1
    return new Promise(function (resolve, reject) {
      if(!isJPG && !isPNG) {
        Message.error('上传的图片格式错误')
        return reject()
      }
      if(!isLt1M) {
        Message.error('图片过大，请压缩后再上传')
        return reject()
      }
      fr.onload = function() {
        let img = new Image
        img.onload = function() {
            let { width, height } = img
            if( width != 750 || height != 300 ) {
              Message.error('上传的图片需满足750*300')
              reject()
            } else {
              resolve()
            }
        }
        img.src = fr.result
      }
      fr.readAsDataURL(file)
    })
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
      type: 'channelEdit/updateData',
      payload: {
        fileList: []
      }
    })
    this.props.dispatch({
      type: 'channelEdit/updateData',
      payload: {
        help: {
          validateStatus: '',
          help: '请上传1M以内的图片'
        }
      }
    })
  }
  render() {
    const { channelEdit: { detail, help, visible, previewImage, fileList  }, form: { getFieldDecorator, getFieldProps }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    const uploadButton = (
      <div>
        <Icon type='plus' />
        <div className='ant-upload-text'>图片</div>
      </div>
    )
    const breadItems = [
      {
        title: '闲置系统'
      },
      {
        title: '频道管理',
        url: '/2/channel'
      },
      {
        title: isEdit ? '编辑' : '新增频道'
      }
    ]
    const { startedAt, endedAt } = detail
    return(
      <Spin spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label='主标题'
          >
            {getFieldDecorator('title', {
              rules: [{
                required: true, message: '请输入6字以内的主标题',
              },{
                max: 6, message: '长度最多6个字符'
              }],
              initialValue: detail.title
            })(
              <Input placeholder='请输入6字以内'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='副标题'
          >
            {getFieldDecorator('subtitle', {
              rules: [{
                required: true, message: '请输入10字以内的副标题',
              },{
                max: 10, message: '长度最多10个字符'
              }],
              initialValue: detail.subtitle
            })(
              <Input placeholder='请输入10字以内'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='描述'
          >
            {getFieldDecorator('description', {
              rules: [{
                required: true, message: '请输入20字以内的描述',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.description
            })(
              <Input placeholder='请输入20字以内'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='类型'
          >
            {getFieldDecorator('type', {
              rules: [{
                required: true, message: '请选择类型!',
              }],
              initialValue: detail.type !== undefined ? detail.type + '' : detail.type
            })(
              <Select placeholder='请选择类型'>
                  <Option value={'0'}>闲置</Option>
                  <Option value={'1'}>每日话题</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='上传图片'
            required
            {...help}
          >
             <Upload
               action={imageServer}
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
    this.props.dispatch({ type: 'channelEdit/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    channelEdit: state.channelEdit,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(ChannelEdit))
