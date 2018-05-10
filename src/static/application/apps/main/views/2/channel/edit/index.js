import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Select, DatePicker, Col, Upload, Icon, Modal, Radio, Checkbox } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../../constant/api'
import { storage } from '../../../../utils/storage.js'
import { trim } from 'lodash'
import moment from 'moment'
import dict from '../../dict.js'

const RangePicker = DatePicker.RangePicker
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
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
        let type = 'channelEdit/add'
        if(id !== 'new') {
          type = 'channelEdit/update'
        }
        values.sortTypes &&  (values.sortTypes = values.sortTypes.join(","))
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
  radioHandler = (e) => {
    if (e.target.value === 0) {
      this.props.dispatch({
        type: 'channelEdit/updateData',
        payload: {
          showInput: true
        }
      })
    } else {
      this.props.dispatch({
        type: 'channelEdit/updateData',
        payload: {
          showInput: false
        }
      })
    }
  }
  render() {
    const { channelEdit: { detail, help, visible, previewImage, fileList, showInput  }, form: { getFieldDecorator, getFieldProps }, match: { params: { id } }, loading } = this.props
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
            label='标题'
          >
            {getFieldDecorator('title', {
              rules: [{
                required: true, message: '请输入10字以内的主标题',
              },{
                max: 10, message: '长度最多10个字符'
              }],
              initialValue: detail.title
            })(
              <Input placeholder='请输入10字以内'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='副标题'
          >
            {getFieldDecorator('subtitle', {
              rules: [{
                required: true, message: '请输入20字以内的副标题',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.subtitle
            })(
              <Input placeholder='请输入20字以内'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='描述'
          >
            {getFieldDecorator('description', {
              rules: [{
                required: true, message: '请输入50字以内的描述',
              },{
                max: 50, message: '长度最多50个字符'
              }],
              initialValue: detail.description
            })(
              <Input placeholder='请输入50字以内'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="所属业务"
          >
            {getFieldDecorator('type', {
              rules: [{
                required: true, message: '请选择所属业务!',
              }],
              initialValue: detail.type !== undefined ? detail.type : 0
            })(
              <RadioGroup onChange={this.radioHandler}>
                {
                Object.keys(dict.app).map((key) => {
                  return <Radio key={key} value={Number(key)}>{dict.app[key]}</Radio>;
                })
              }
              </RadioGroup>
            )}
          </FormItem>
          {
            showInput ? (
              <div>
                <FormItem
                  {...formItemLayout}
                  label='用户可发'
                >
                  {getFieldDecorator('isOfficial', {
                    rules: [{
                      required: true, message: '请选择用户可发!',
                    }],
                    initialValue: detail.isOfficial !== undefined ? detail.isOfficial : 0
                  })(
                    <RadioGroup>
                      <Radio value={0}>可发</Radio>
                      <Radio value={1}>不可发</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="默认帖子类型"
                >
                  {getFieldDecorator('topicTypeSuggestion', {
                    rules: [{
                      required: true, message: '请选择默认帖子类型!',
                    }],
                    initialValue: detail.topicTypeSuggestion  !== undefined ? detail.topicTypeSuggestion : 0
                  })(
                    <RadioGroup>
                    {
                      dict.topicTypes.map(({ id, desc }) => {
                        return <Radio key={id} value={Number(id)}>{desc}</Radio>;
                      })
                    }
                    </RadioGroup>
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="排序维度"
                >
                  {getFieldDecorator('sortTypes', {
                    rules: [{
                      required: true, message: '请选择排序维度!',
                    }],
                    initialValue: detail.sortTypes !== undefined ? detail.sortTypes.split(",").map(val => Number(val)) : [0, 5]
                  })(
                    <CheckboxGroup>
                    {
                      Object.keys(dict.sortTypes).map((key) => {
                        return <Checkbox key={key} value={Number(key)}>{dict.sortTypes[key]}</Checkbox>;
                      })
                    }
                    </CheckboxGroup>
                  )}
                </FormItem>
              </div>
            ) : null
          }
          <FormItem
            {...formItemLayout}
            label='配图'
            required
            {...help}
          >
             <Upload
               className="avatar-uploader"
               style={{width: '300px', height: '100%'}}
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
