import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Upload, Icon, Modal, Radio, AutoComplete } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../../utils/debug.js'
import { storage } from '../../../../utils/storage.js'
import { trim, debounce } from 'lodash'
import moment from 'moment'

const RadioGroup = Radio.Group
const Option = AutoComplete.Option
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const imageServer = `${API_SERVER}/upload/twoUser`
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

class UserEdit extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const { match: { params: { id } } } = this.props
    id !== 'new' && this.props.dispatch({
      type: 'userEdit/detail',
      payload: {
        id: id
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { match: { params: { id } }, history, userEdit: { fileList } } = this.props

      if(fileList[0] && fileList[0].image) {
        values.avatorUrl = fileList[0].image
      } else {
        this.props.dispatch({
          type: 'userEdit/updateData',
          payload: {
            help: {
              validateStatus: 'error',
              help: '请选择图片上传'
            }
          }
        })
        return
      }
      if(!err) {
        values.schoolId = Number(values.schoolId)
        // const schoolInfo = this.props.userEdit.schoolData.filter(obj => {
        //   return obj.id === values.schoolId
        // })[0]
        // schoolInfo.schoolName = schoolInfo.name

        let type = 'userEdit/add'
        if(id !== 'new') {
          type = 'userEdit/update'
        }
        // values = { ...values, ...schoolInfo }
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
      type: 'userEdit/showModal',
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
            type: 'userEdit/updateData',
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
            type: 'userEdit/updateData',
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
      type: 'userEdit/updateData',
      payload: {
        fileList: fileList
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'userEdit/hideModal'
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
            if( width != 650 || height != 650 ) {
              Message.error('上传的图片需满足650*650')
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
      type: 'userEdit/updateData',
      payload: {
        fileList: []
      }
    })
    this.props.dispatch({
      type: 'userEdit/updateData',
      payload: {
        help: {
          validateStatus: '',
          help: '请上传1M以内,650*650的图片'
        }
      }
    })
  }
  handleSelect = () => {
    this.props.dispatch({
      type: 'userEdit/updateData',
      payload: {
        disabled: false
      }
    })
  }
  handleSearch = _.debounce((filterKey) => {
    if(filterKey) {
      this.props.dispatch({
        type: 'userEdit/schoolList',
        payload: {
          data: {
            name: filterKey,
            pagination: false
          }
        }
      })
    }
  },1000)
  debounceSearch =(filterKey)=> {
    if(filterKey) {
      this.props.dispatch({
        type: 'userEdit/updateData',
        payload: {
          disabled: true
        }
      })
    }  else {
      this.props.dispatch({
        type: 'userEdit/updateData',
        payload: {
          disabled: false
        }
      })
    }
     this.handleSearch(filterKey)
  }
  render() {
    const { userEdit: { detail, help, visible, previewImage, fileList, schoolData, disabled  }, form: { getFieldDecorator, getFieldProps }, match: { params: { id } }, loading } = this.props
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
        title: '用户管理',
        url: '/2/users'
      },
      {
        title: isEdit ? '编辑' : '新增用户'
      }
    ]
    const { startedAt, endedAt } = detail
    return(
      <Spin spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label='昵称'
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入10字以内的昵称',
              },{
                max: 10, message: '长度最多10个字符'
              }],
              initialValue: detail.name
            })(
              <Input placeholder='请输入10字以内'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='头像'
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
          <FormItem
            {...formItemLayout}
            label="用户类型"
          >
            {getFieldDecorator('isOfficial', {
              rules: [{
                required: true, message: '请选择用户类型',
              }],
              initialValue: detail.isOfficial || 1
            })(
              <RadioGroup>
                <Radio value={0}>普通用户</Radio>
                <Radio value={1}>马甲</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="学校"
          >
            {getFieldDecorator('schoolId', {
              rules: [{
                required: true, message: '请选择学校',
              }],
              initialValue: detail.schoolId
            })(
              <AutoComplete
                placeholder='学校'
                allowClear
                onSelect={this.handleSelect}
                onSearch={this.debounceSearch}>
                {
                  schoolData.map((value) => {
                    return <Option key={value.id}>{value.name}</Option>;
                  })
                }
              </AutoComplete>
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
    this.props.dispatch({ type: 'userEdit/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    userEdit: state.userEdit,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(UserEdit))
