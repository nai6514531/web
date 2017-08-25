import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Select, Button, Popconfirm, Input, Modal, Form } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import styles from './index.pcss'
import { status } from './dict.js'

const FormItem = Form.Item
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
const Option = Select.Option
const breadItems = [
  {
    title: '闲置系统'
  },
  {
    title: '圈子管理',
    url: '/2/circle'
  },
  {
    title: '商品管理'
  }
]
class Topic extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.hash)
    delete search.page
    delete search.per_page
    this.search = search
    this.state = {
      channel_id: search.channel_id
    }
    this.columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '所属学校',
        dataIndex: 'schoolName',
        key: 'schoolName',
      },
      {
        title: '所属频道',
        dataIndex: 'channelTitle',
        key: 'channelTitle',
      },
      {
        title: '发布时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
      },
      {
        title: '商品发布人',
        dataIndex: 'userName',
        key: 'userName',
      },
      {
        title: '商品首图',
        render: (text, record, index) => {
          if(record.url) {
            return (
              <img
                src={record.url}
                alt='商品首图'
                style={{ width: '50px', height: '30px' }}
                onClick={() => {
                  this.props.dispatch({
                    type: 'topic/showImageModal',
                    payload: {
                      previewImage: record.url
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
        title: '浏览量',
        dataIndex: 'uniqueVisitor',
        key: 'uniqueVisitor',
      },
      {
        title: '评论数',
        dataIndex: 'comments',
        key: 'comments',
      },
      {
        title: '交易状态',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/2/topic/${record.id}`}>查看详情|</Link>
              <a href='javascript:void(0)' onClick={ this.show.bind(this, record) }>{'\u00A0'}移动频道|</a>
              {
                (() => {
                  if(record.status === 0) {
                    return (
                      <Popconfirm title={`是否确定要下架该商品`} onConfirm={ this.updateStatus.bind(this,record.id,3) } >
                        <a href='javascript:void(0)'>{'\u00A0'}下架商品</a>
                      </Popconfirm>
                    )
                  }
                  if(record.status === 3) {
                    return <a href='javascript:void(0)' onClick={ this.updateStatus.bind(this,record.id,0) }>{'\u00A0'}上架商品</a>
                  }
                })()
              }
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = transformUrl(location.hash)
    this.props.dispatch({
      type: 'topic/list',
      payload: {
        data: url
      }
    })
  }
  show = (record) => {
    this.props.dispatch({
      type: 'topic/showModal',
      payload: {
        data: record
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'topic/hideModal',
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const id = this.props.topic.record.id
        const url = transformUrl(location.hash)
        values.channelId = Number(values.channelId)
        this.props.dispatch({
          type: 'topic/moveTopic',
          payload: {
            id,
            url,
            data: { values }
          }
        })
      }
    })
  }
  updateStatus = (id, status) => {
    const url = transformUrl(location.hash)
    this.props.dispatch({
      type: 'topic/updateStatus',
      payload: {
        id,
        url,
        data: { status }
      }
    })
  }
  changeHandler = (type, e) => {
    this.search = { ...this.search, [type]: e.target.value }
  }
  selectHandler =  (type, value) => {
    if(!value) {
      value = ''
    }
    if(type === 'channel_id') {
      this.setState({
        channel_id: value
      })
    }
    this.search = { ...this.search, [type]: value }
  }
  searchClick = () => {
    location.hash = toQueryString({ ...this.search })
  }
  renderStatus = (data) => {
    let item = []
    for( let key in data ) {
      item.push(<Option value={key} key={key}>{data[key]}</Option>)
    }
    return item
  }
  renderChannel = (data) => {
    return data.map(value => {
      return (
        <Option value={value.id + ''} key={value.id}>{value.title}</Option>
      )
    })
  }
  render() {
    const { form: { getFieldDecorator }, topic: { data: { objects, pagination }, record, key, visible, previewVisible, previewImage, channel }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Input
          placeholder='商品发布人'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.name}
         />
        <Input
          placeholder='商品关键字'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'key_word')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.key_word}
         />
        <Input
          placeholder='商品学校'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'school_name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.school_name}
         />
        <Select
          value={ this.state.channel_id && this.state.channel_id + '' }
          allowClear
          className={styles.input}
          placeholder='商品频道'
          onChange={this.selectHandler.bind('this','channel_id')}>
            { this.renderChannel(channel)}
        </Select>
        <Select
          defaultValue={this.search.status}
          allowClear
          className={styles.input}
          placeholder='商品状态'
          onChange={this.selectHandler.bind('this','status')}>
            { this.renderStatus(status) }
        </Select>
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            查询
          </Button>
        </span>
        <DataTable
          scroll={{ x: 700 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
        />
        <Modal
          title={`帖子频道`}
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          key={key}
         >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label='帖子名称'
            >
              <span>{'暂时缺少的字段'}</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='当前帖子频道'
            >
              <span>{record.channelTitle}</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='将帖子移动至'
            >
              {getFieldDecorator('channelId', {
                rules: [{
                  required: true, message: '必填项!',
                }]
              })(
                <Select allowClear>
                  { this.renderChannel(channel)}
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
        <Modal visible={previewVisible} footer={null} onCancel={this.hide}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'topic/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    topic: state.topic,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Topic))

