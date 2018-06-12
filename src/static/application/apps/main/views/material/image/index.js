import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Form, Modal, Input, Button, Popconfirm, message, Upload, Icon, Popover, Row } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import moment from 'moment'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { transformUrl, toQueryString } from '../../../utils/'
import styles from '../../../assets/css/search-bar.pcss'
import { API_SERVER } from '../../../constant/api'
import { storage } from '../../../utils/storage.js'
import { trim } from 'lodash'

const FormItem = Form.Item
const imageServer = `${API_SERVER}/upload/image`
const confirm = Modal.confirm
const formItemLayout = {
   labelCol: {
     xs: { span: 24 },
     sm: { span: 6 },
   },
   wrapperCol: {
     xs: { span: 24 },
     sm: { span: 14 },
   }
}
const breadItems = [
  {
    title: '设置'
  },
  {
    title: '元素'
  }
]

class Image extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = {limit: 10, offset: 0, ...search }
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '图片名', dataIndex: 'name',key: 'name' },
      {
        title: '图片预览',
        render: (text, record, index) => {
          if(record.url) {
            return (
              <img
                src={record.url}
                alt='图片加载失败'
                style={{ width: '50px', height: '30px' }}
                onClick={() => {
                  this.props.dispatch({
                    type: 'image/updateData',
                    payload: {
                      previewImage: record.url,
                      previewVisible: true
                    }
                  })
                }}/>
            )
          }
          return (
            <span>暂无图片</span>
          )
        }
      },
      {
        title: '尺寸',
        render: (text, record) => {
          return (
            <span>{`${record.width} * ${record.height}`}</span>
          )
        }
      },
      {
         title: '地址',
         render: (text, record) => {
          return (
            <span>
               <Popover
                content={
                  <Row style={{padding: 10}}>{record.url}</Row>
                }>
                  <span>{`${record.url.slice(0,20)}...`}</span>
              </Popover>
              <CopyToClipboard
                text={record.copiedValue}
                onCopy={this.copyHandler}>
                <Button style={{ marginLeft: '30px'}}  type="primary" icon="copy" />
              </CopyToClipboard>
            </span>
          )
        }
      },
      {
        title: '上传时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (text, record) => {
          return`${moment(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}`
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a href='javascript:void(0)' onClick={ this.show.bind(this,record) }>编辑</a> |
              <Popconfirm title='确认删除?' onConfirm={ this.delete.bind(this,record.id) } >
                <a href='javascript:void(0)'>{'\u00A0'}删除</a>
              </Popconfirm>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = this.search
    this.fetch(url)
  }
  fetch = (params) => {
    this.props.dispatch({
      type: 'image/list',
      payload: {
        data: params
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { image: { record: { id }, fileList } } = this.props
        let type = 'image/add'
        if(id) {
          type = 'image/update'
        }
        if(fileList[0] && fileList[0].image) {
          values.url = fileList[0].image
        } else {
          this.props.dispatch({
            type: 'image/updateData',
            payload: {
              help: {
                validateStatus: 'error',
                help: '请选择图片上传'
              }
            }
          })
          return
        }

        let imageNode = document.querySelector('.ant-upload-list-item-thumbnail > img')
        values.name = trim(values.name)
        values.format = values.url.split(".")[1]
        values.width = imageNode.naturalWidth
        values.height = imageNode.naturalHeight
        this.props.dispatch({
          type: type,
          payload: {
            data: values,
            id: id,
            search: this.search
          }
        })
      }
    })
  }
  show = (record) => {
    if( record.url ) {
      const image = record.url.split('/')
      this.props.dispatch({
        type: 'image/updateData',
        payload: {
          visible: true,
          help: {
            validateStatus: 'success',
            help: '图片上传成功'
          },
          fileList: [{
            image: image[image.length - 1],
            url: record.url,
            uid: -1,
            status: 'done',
            percent: 100,
          }],
          record
        }
      })
    } else {
      this.props.dispatch({
        type: 'image/updateData',
        payload: {
          visible: true,
          help: {
            validateStatus: '',
            help: '请上传5M以内的图片'
          },
          fileList: [],
          record
        }
      })
    }
  }
  hide = () => {
    this.props.dispatch({
      type: 'image/updateData',
      payload: {
        visible : false
      }
    })
  }
  hidePreviewModal = () => {
    this.props.dispatch({
      type: 'image/updateData',
      payload: {
        previewVisible : false
      }
    })
  }
  copyHandler = (record, text, result) => {
    message.success("复制成功")
  }
  delete = (id) => {
    this.props.dispatch({
      type: 'image/delete',
      payload: {
        id: id,
        search: this.search
      }
    })
  }
  changeHandler =  (type, e) => {
    this.search = { ...this.search, [type]: e.target.value }
  }
  searchClick = () => {
    this.search.offset = 0
    this.search.limit = transformUrl(location.search).limit || 10
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    this.props.history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
  }
  reset = () => {
    const { resetFields, getFieldsValue } = this.props.form
    resetFields(Object.keys(getFieldsValue()))
    this.props.dispatch({
      type: 'image/updateData',
      payload: {
        fileList: [],
        help: {
          validateStatus: '',
          help: '请上传5M以内的图片'
        }
      }
    })
  }
  handlePreview = (file) => {
    this.props.dispatch({
      type: 'image/updateData',
      payload: {
        previewVisible: true,
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
            type: 'image/updateData',
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
            type: 'image/updateData',
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
      type: 'image/updateData',
      payload: {
        fileList: fileList
      }
    })
  }
  beforeUpload = (file, fileList) => {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isGIF = file.type === 'image/gif'
    if(!isJPG && !isPNG && !isGIF) {
      Message.error('上传的图片格式错误')
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if(!isLt5M) {
      Message.error('图片过大，请压缩后再上传')
    }
    return (isJPG || isPNG || isGIF) && isLt5M
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
      type: 'image/updateData',
      payload: {
        fileList: []
      }
    })
    this.props.dispatch({
      type: 'image/updateData',
      payload: {
        help: {
          validateStatus: '',
          help: '请上传5M以内的图片'
        }
      }
    })
  }
  render() {
    const { form: { getFieldDecorator }, image: { help, fileList, key, visible, previewVisible, previewImage, record, data: { objects, pagination } }, loading  } = this.props
    const title = record.id ? '编辑图片' : '添加图片'
    const uploadButton = (
      <div>
        <Icon type='plus' />
        <div className='ant-upload-text'>图片</div>
      </div>
    )
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Input
          placeholder='请输入图片名'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.name}
         />
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          >
          搜索
        </Button>
        <Button
          type='primary'
          onClick={this.show.bind(this,{})}
          style={{marginBottom: '20px'}}
          >
          添加图片
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
        <Modal
          title={title}
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          afterClose={this.reset}
         >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label='图片名'
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true, message: '请输入图片名!',
                },{
                  max: 20, message: '长度最多20个字符'
                }],
                initialValue: record.name
              })(
                <Input />
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
            </FormItem>
          </Form>
        </Modal>
        <Modal visible={previewVisible} footer={null} onCancel={this.hidePreviewModal}>
          <img alt="图片加载失败" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'image/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    image: state.image,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Image))
