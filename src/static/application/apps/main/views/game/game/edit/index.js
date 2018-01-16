import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Form, Input, Button, Select, DatePicker, Col, Upload, Icon, Modal, message, Message } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../../utils/debug.js'
import { trim, difference } from 'lodash'
import moment from 'moment'
import supplierService from '../../../../services/game/supplier'
import labelService from '../../../../services/game/label'
import gameService from '../../../../services/game/game'
import { storage } from '../../../../utils/storage.js'

const RangePicker = DatePicker.RangePicker
const confirm = Modal.confirm
const { Option } = Select
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const imageServer = `${API_SERVER}/upload/game`
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

class GameEdit extends Component {
  constructor(props) {
    super(props)
    this.state = {
      suppliers: [],
      labels: [],
      previewImage: '',
      visible: false, 
      imageList: [],
      imageHelp: {},
      iconList: [],
      iconHelp: {},      
      detail: {},
      oldLabelIds: [],
    }
  }
  componentDidMount() {
    const { match: { params: { id } } } = this.props
    if (id != 'new') {
      this.detail(id)
    }
    this.suppliers();
    this.labels();    
  }
  add = (data) => {
    const self = this;
    gameService.add(data).then(function(result){
      if(result.status == 'OK') {
        self.props.history.goBack()
        self.setState((prevState, props) => {
          return { detail: result.data };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  update = (id, data) => {
    const self = this;
    gameService.update(id, data).then(function(result){
      if(result.status == 'OK') {
        self.props.history.goBack()              
        self.setState((prevState, props) => {
          return { detail: result.data };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  detail = (id) => {
    const self = this;
    gameService.detail(id).then(function(result){
      if(result.status == 'OK') {
        const theImage = result.data.image.split('/')
        const theIcon = result.data.icon.split('/')  

        let labelIds = [];
        if (result.data.labelList) {
          labelIds = result.data.labelList.map(function(item) {
            return item.id + '';
          })
        }      

        self.setState((prevState, props) => {
          return { 
            detail: result.data,
            oldLabelIds: labelIds,
            imageList: [{
              image: theImage[theImage.length - 1],
              url: result.data.image,
              uid: -1,
              status: 'done',
              percent: 100,
            }],
            iconList: [{
              image: theIcon[theIcon.length - 1],
              url: result.data.icon,
              uid: -2,
              status: 'done',
              percent: 100,
            }],
           };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  suppliers = () => {
    const self = this;
    supplierService.list().then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { suppliers: result.data.objects };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  labels = () => {
    const self = this;
    labelService.list().then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { labels: result.data };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history, game: { fileList } } = this.props
        const { imageList, iconList, oldLabelIds } = this.state

        console.log('iconList', iconList)
        if(iconList[0] && iconList[0].image) {
          values.icon = iconList[0].image
        } else {
          this.setState({
            iconHelp: {
              validateStatus: 'error',
              help: '请选择图片上传'
            }
          })
          return
        }

        if(imageList[0] && imageList[0].image) {
          values.image = imageList[0].image
        } else {
          this.setState({
            imageHelp: {
              validateStatus: 'error',
              help: '请选择图片上传'
            }
          })
          return
        }
        
        values.title = trim(values.title) 
        values.profile = trim(values.profile) 
        values.description = trim(values.description)      
        values.shareContent = trim(values.shareContent)  
        values.shareTitle = trim(values.shareTitle)                                
        values.status = Number(trim(values.status))
        values.divide = Number(trim(values.divide)) * 10000

        values.supplierId = Number(trim(values.supplierId))
        values.url = trim(values.url)  
        values.startedAt = moment(values.time[0],moment.ISO_8601).format()
        values.endedAt = moment(values.time[1],moment.ISO_8601).format()

        values.addLabelIds = difference(values.labelIds, oldLabelIds)   
        values.deleteLabelIds = difference(oldLabelIds, values.labelIds)

        if(id !== 'new') {
         this.update(id, values)
        } else {
          this.add( values)
        }
      }
    })
  }
  cancelHandler = () => {
    this.props.history.goBack()
  }
  hideModal = () => {
    this.setState({visible: false})
  }
  trim = ( description, rule, value, callback) => {
    const result = !trim(value)
    if ( result && value != '' ) {
      callback(description)
    } else {
      callback()
    }
  }
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      visible: true,
    })
  }
  handleChange = (id, {fileList, event, file}) => {
    let help = 'imageHelp';
    let list = 'imageList';
    if (id == 'icon') {
      help = 'iconHelp'
      list = 'iconList'
    }
    fileList = fileList.map((file) => {
      if (file.response) {
        file.image = file.response.data
      }
      return file
    })
    fileList = fileList.filter((file) => {
      if (file.response) {
        if(file.response.status === 'OK') {
          this.setState({
            [help]: {
              validateStatus: 'success',
              help: '图片上传成功'
            }
          })
          return file.response.status === 'OK'
        } else {
          this.setState({
            [help]: {
              validateStatus: 'error',
              help: '图片上传失败,请重新尝试'
            }
          })
          return false
        }
      }
      return true
    })
    this.setState({[list]: fileList})
  }
  beforeUpload = (file, fileList) => {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isGIF = file.type === 'image/gif'
    if(!isJPG && !isPNG && !isGIF) {
      Message.error('上传的图片格式错误')
    }
    const isLt1M = file.size / 1024 / 1024 < 1
    if(!isLt1M) {
      Message.error('图片过大，请压缩后再上传')
    }
    return (isJPG || isPNG || isGIF) && isLt1M
  }
  showConfirm = (id, file) => {
    confirm({
      title: '是否删除该图片?',
      okText: '确认',
      cancelText: '取消',
      onOk: () => this.onRemove(id)
    })
    return false
  }
  onRemove = (id) => {
    const help = {
      validateStatus: '',
      help: '请上传1M以内的图片'
    }
    if (id == 'icon') {
      this.setState({
        iconList: [],
        iconHelp: help
      })
    } else {
      this.setState({
        imageList: [],
        imageHelp: help
      })
    }
  }
  render() {
    const {  form: { getFieldDecorator, getFieldProps }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    const {  detail, suppliers, labels, previewImage, visible, imageList, imageHelp, iconList, iconHelp, oldLabelIds } = this.state
    const { startedAt, endedAt } = detail    
    const uploadButton = (
      <div>
        <Icon type='plus' />
        <div className='ant-upload-text'>图片</div>
      </div>
    )
   
    const breadItems = [
      {
        title: '游戏管理系统'
      },
      {
        title: '游戏管理',
        url: '/game/game'
      },
      {
        title: isEdit ? '编辑游戏' : '新增游戏'
      }
    ]
    return(
      <Spin spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
            <FormItem
                {...formItemLayout}
                label='游戏名称'
            >
            {getFieldDecorator('title', {
              rules: [{
                required: true, message: '请输入20字以内的游戏名',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.title
            })(
              <Input placeholder='请输入游戏名' />              
            )}
          </FormItem>
          { isEdit ? <FormItem
                {...formItemLayout}
                label='游戏Id'
            >
            {getFieldDecorator('id', {
              initialValue: detail.id
            })(
              <Input  readOnly />
            )}
          </FormItem>:''}
          <FormItem
            {...formItemLayout}
            label="供应商"
          >
            {getFieldDecorator('supplierId', {
              rules: [
                { required: true, message: '请选择供应商' },
              ],
              initialValue: detail.supplierId !== undefined ? detail.supplierId + '' : undefined 
            })(
              <Select
                showSearch
                allowClear
                style={{ width: 150, marginRight: 10 }}          
                placeholder="供应商"
                optionFilterProp="children"
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
                {
                suppliers.map(value => {
                  const disabled = value.status == 0 ?  false : true
                  return (
                      <Option value={value.id + ''} key={value.id} disabled={disabled}>{value.name}</Option>
                  )
                })
            }
            </Select>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='简介'
            >
            {getFieldDecorator('profile', {
              rules: [{
                required: true, message: '请输入20字以内的游戏简介',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.profile
            })(
              <Input placeholder='请输入游戏简介'/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='详情介绍'
            >
            {getFieldDecorator('description', {
              rules: [{
                required: true, message: '请输入200字以内的详情介绍',
              },{
                max: 200, message: '长度最多200个字符'
              }],
              initialValue: detail.description
            })(
              <Input placeholder='请输入详情介绍' type="textarea"/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='分享标题'
            >
            {getFieldDecorator('shareTitle', {
              rules: [{
                required: true, message: '请输入20字以内的分享标题',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.shareTitle
            })(
              <Input placeholder='请输入游戏分享标题'/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='分享内容'
            >
            {getFieldDecorator('shareContent', {
              rules: [{
                required: true, message: '请输入30字以内的分享内容',
              },{
                max: 30, message: '长度最多30个字符'
              }],
              initialValue: detail.shareContent
            })(
              <Input placeholder='请输入游戏分享'/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='我方分成'
            >
            {getFieldDecorator('divide', {
              rules: [{
                pattern: /^(0(\.\d{4})?|1(\.0{4})?)$/, message: '请按0.0000格式输入，最大不超过1'                
              }],
              initialValue:  detail.divide !== undefined ? (detail.divide/10000).toFixed(4): 0.0000  
            })(
              <Input placeholder='请按0.0000格式输入我方分成比例'/>
            )}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label='小图标'
            required
            {...iconHelp}
          >
             <Upload
               action={imageServer}
               listType='picture-card'
               fileList={iconList}
               onPreview={this.handlePreview}
               onChange={this.handleChange.bind(this, 'icon')}
               beforeUpload={this.beforeUpload}
               onRemove={this.showConfirm.bind(this, 'icon')}
               headers={{ Authorization: 'Bearer ' + (storage.val('token') || '') }}
               withCredentials={true}
             >
               {iconList.length == 1 ? null : uploadButton}
             </Upload>
             <Modal visible={visible} footer={null} onCancel={this.hideModal}>
               <img alt='图片加载失败' style={{ padding: 15, width: '100%' }} src={previewImage} />
             </Modal>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label='详情图'
            required
            {...imageHelp}
          >
             <Upload
               action={imageServer}
               listType='picture-card'
               fileList={imageList}
               onPreview={this.handlePreview}
               onChange={this.handleChange.bind(this, 'image')}
               beforeUpload={this.beforeUpload}
               onRemove={this.showConfirm.bind(this, 'image')}
               headers={{ Authorization: 'Bearer ' + (storage.val('token') || '') }}
               withCredentials={true}
             >
               {imageList.length == 1 ? null : uploadButton}
             </Upload>
             <Modal visible={visible} footer={null} onCancel={this.hideModal}>
               <img alt='图片加载失败' style={{ padding: 15, width: '100%' }} src={previewImage} />
             </Modal>
          </FormItem>
           
           
            <FormItem
                {...formItemLayout}
                label='游戏地址'
            >
            {getFieldDecorator('url', {
              rules: [{
                required: true, message: '请输入游戏地址',
              }],
              initialValue: detail.url
            })(
              <Input placeholder='请输入游戏地址'/>
            )}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label='上下架'
          >
            {getFieldDecorator('status', {
              rules: [{
                required: true, message: '请选择游戏状态',
              }],
              initialValue: detail.status !== undefined ? detail.status + '' : '0'
            })(
              <Select placeholder='请选择游戏状态'>
                <Option value={'0'}>上架</Option>
                <Option value={'1'}>下架</Option>
              </Select>
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
            label="标签"
          >
            {getFieldDecorator('labelIds', {
              rules: [
                { required: true,  message: '请选择标签' },
                { type: "array", max: 3, message: '请选择不超过3个标签'}
              ],
              initialValue: oldLabelIds        
            })(
              <Select
                mode="multiple"
                showSearch
                allowClear
                style={{ width: '100%'}}          
                placeholder="标签"
                optionFilterProp="children"
                filterOption={(input, option) => option.props.children.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
                {
                labels.map(value => {
                return (
                    <Option value={value.id + ''} key={value.id}><span style={{color: '#'+value.color}}>{value.name}</span></Option>
                )
                })
            }
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
    this.props.dispatch({ type: 'game/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    game: state.game,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(GameEdit))
