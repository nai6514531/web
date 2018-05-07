import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Upload, Icon, Modal, Radio, AutoComplete, Select, InputNumber, Checkbox } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../../constant/api'
import { storage } from '../../../../utils/storage.js'
import { transformUrl, toQueryString } from '../../../../utils/'
import { trim, debounce, merge } from 'lodash'
import dict from '../../dict.js'
import moment from 'moment'

const { TextArea } = Input
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const Option = AutoComplete.Option
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const imageServer = `${API_SERVER}/upload/topic`
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

class TopicEdit extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
  }
  componentDidMount() {
    const { match: { params: { id } } } = this.props
    id === 'new' && this.props.dispatch({
      type: 'topicEdit/channelList',
      payload: {
        data: {
          pagination: false
        }
      }
    })
    id !== 'new' && this.props.dispatch({
      type: 'topicEdit/detail',
      payload: {
        id: id
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      let dimensions = values.dimensions.map(key => {
        values[key] = 0
      })
      values = Object.assign({}, dict.defaultDimensions, values)
      delete values.dimensions
      const { match: { params: { id } }, history, topicEdit: { fileList } } = this.props
      if(!err) {
        let type = 'topicEdit/add'
        if(id !== 'new') {
          type = 'topicEdit/update'
        }
        if(fileList.length) {
          values.images = fileList.map((value, index) => {
            return {
              id: index + 1,
              url: `/topic/${value.image}`
            }
          })
        }
        if(values.value) {
          values.value = Number(values.value) * 100
        }
        values.userId = Number(values.userId)
        values.channelIds = values.channelIds.join(",")
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
      type: 'topicEdit/showModal',
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
            type: 'topicEdit/updateData',
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
            type: 'topicEdit/updateData',
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
      type: 'topicEdit/updateData',
      payload: {
        fileList: fileList
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'topicEdit/hideModal'
    })
  }
  beforeUpload =  (file, fileList) => {
    const fr = new FileReader
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isLt1M = file.size / 1024 / 1024 < 1
    let self = this
    return new Promise(function (resolve, reject) {
      const result = self.props.topicEdit.fileList.filter(value => {
        return value.name === file.name
      })

      if(result.length) {
        Message.error('上传的图片重复')
        return reject()
      }

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
          resolve()
        }
        img.src = fr.result
      }
      fr.readAsDataURL(file)
    })
  }
  showConfirm = (fileInfo) => {
    confirm({
      title: '是否删除该图片?',
      okText: '确认',
      cancelText: '取消',
      onOk: this.onRemove.bind(this,fileInfo)
    })
    return false
  }
  onRemove = (fileInfo) => {
    const fileList = this.props.topicEdit.fileList.filter(value => {
      return value.name !== fileInfo.name
    })
    this.props.dispatch({
      type: 'topicEdit/updateData',
      payload: {
        fileList
      }
    })
    if(!fileList.length) {
      this.props.dispatch({
        type: 'topicEdit/updateData',
        payload: {
          help: {
            validateStatus: '',
            help: '请上传1M以内的图片'
          }
        }
      })
    }
  }
  handleSelect = () => {
    this.props.dispatch({
      type: 'topicEdit/updateData',
      payload: {
        disabled: false
      }
    })
  }
  radioHandler = (e) => {
    if (e.target.value === 0) {
      this.props.dispatch({
        type: 'topicEdit/updateData',
        payload: {
          showPrice: true
        }
      })
    } else {
      this.props.dispatch({
        type: 'topicEdit/updateData',
        payload: {
          showPrice: false
        }
      })
    }
  }
  handleSearch = _.debounce((filterKey) => {
    if(filterKey) {
      this.props.dispatch({
        type: 'topicEdit/userList',
        payload: {
          data: {
            name: filterKey,
            pagination: false,
            isOfficial: 1
          }
        }
      })
    }
  },1000)
  debounceSearch =(filterKey)=> {
    if(filterKey) {
      this.props.dispatch({
        type: 'topicEdit/updateData',
        payload: {
          disabled: true
        }
      })
    }  else {
      this.props.dispatch({
        type: 'topicEdit/updateData',
        payload: {
          disabled: false
        }
      })
    }
     this.handleSearch(filterKey)
  }
  render() {
    const { topicEdit: { detail, help, visible, previewImage, fileList, userData, channelData, disabled, showPrice  }, form: { getFieldDecorator, getFieldProps }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    const { startedAt, endedAt } = detail
    const uploadButton = (
      <div>
        <Icon type='plus' />
        <div className='ant-upload-text'>图片</div>
      </div>
    )
    const { from, cityId, channelId } = this.search
    let breadItems
    if(from == 'city') {
      breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '城市管理',
          url: `/2/city`
        },
        {
          title: '帖子管理',
          url: `/2/topic/?cityId=${cityId}&from=${from}`
        },
        {
          title: isEdit ? '编辑' : '新增帖子'
        }
      ]
    } else if(from == 'channel') {
      breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '频道管理',
          url: `/2/channel`
        },
        {
          title: '帖子管理',
          url: `/2/topic?channelId=${channelId}&from=${from}`
        },
        {
          title: isEdit ? '编辑' : '新增帖子'
        }
      ]
    } else {
      breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '帖子管理',
          url: `/2/topic`
        },
        {
          title: isEdit ? '编辑' : '新增帖子'
        }
      ]
    }
    return(
      <Spin spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem
              {...formItemLayout}
              label='发布频道'
            >
              {getFieldDecorator('channelIds', {
                rules: [{
                  required: true, message: '请选择发布频道!',
                }],
                initialValue: detail.channelIds
              })(
                <Select
                  mode="multiple"
                  placeholder='请选择发布频道'>
                  {
                    channelData.map((value) => {
                      return <Select.Option value={value.id} key={value.id}>{value.title}</Select.Option>
                    })
                  }
                  <Select.Option value={'0'} key={'0'}>无频道</Select.Option>
                </Select>
              )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="帖子类型"
          >
            {getFieldDecorator('type', {
              rules: [{
                required: true, message: '请选择帖子类型!',
              }],
              initialValue: detail.type
            })(
              <RadioGroup
                onChange={this.radioHandler}>
              {
                Object.keys(dict.topicTypes).map((key) => {
                  return <Radio key={key} value={Number(key)}>{dict.topicTypes[key]}</Radio>;
                })
              }
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='内容'
          >
            {getFieldDecorator('content', {
              rules: [{
                required: true, message: '请输入100字以内的内容',
              },{
                max: 100, message: '长度最多100个字符'
              }],
              initialValue: detail.content
            })(
              <TextArea placeholder='请输入100字以内'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='配图'
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
               {fileList.length > 9 ? null : uploadButton}
             </Upload>
             <Modal visible={visible} footer={null} onCancel={this.hide}>
               <img alt='图片加载失败' style={{ padding: 15, width: '100%' }} src={previewImage} />
             </Modal>
          </FormItem>
          {
            showPrice ? (
              <FormItem
                {...formItemLayout}
                label='价格'
              >
                {getFieldDecorator('value', {
                  rules: [{
                    required: true, message: '请输入价格',
                  }],
                  initialValue: detail.value ? detail.value / 100 : 0
                })(
                  <InputNumber placeholder='请输入价格' precision={2}/>
                )}
              </FormItem>
            ) : null
          }
          <FormItem
            {...formItemLayout}
            label="发布人"
          >
            {getFieldDecorator('userId', {
              rules: [{
                required: true, message: '请选择发布人',
              }],
              initialValue: detail.userId !== undefined ? detail.userId + '' : detail.userId
            })(
              <AutoComplete
                placeholder='发布人'
                allowClear
                onSelect={this.handleSelect}
                onSearch={this.debounceSearch}>
                {
                  userData.map((value) => {
                    return <Option value={value.id + ''} key={value.id}>{value.name}</Option>;
                  })
                }
              </AutoComplete>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="互动维度"
          >
            {getFieldDecorator('dimensions', {
              initialValue: detail.dimensions !== undefined ? detail.dimensions : []
            })(
              <CheckboxGroup>
                <Checkbox key={0} value={'likeDisabled'}>点赞</Checkbox>
                <Checkbox key={1} value={'commentDisabled'}>留言</Checkbox>
                <Checkbox key={2} value={'messageDisabled'}>私聊</Checkbox>
              </CheckboxGroup>
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
              disabled={disabled}
              onClick={this.handleSubmit}>
              保存
            </Button>
          </FormItem>
        </Form>
      </Spin>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'topicEdit/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    topicEdit: state.topicEdit,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(TopicEdit))
