import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Select, Button, Popconfirm, Input, Modal, Form, Popover, Row, Col } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import InputWithClear from '../../../components/input-with-clear/'
import moment from 'moment'
import { trim } from 'lodash'
import styles from './index.pcss'
import dict from '../../../utils/dict.js'

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

const confirm = Modal.confirm
const Option = Select.Option

class Topic extends Component {
  constructor(props) {
    super(props)
    this.search = transformUrl(location.search)
    let { from, cityId, channelId } = this.search
    if(from === 'city') {
      this.createUrl = `/2/topic/new?from=${from}&cityId=${cityId}`
    } else if(from === 'channel') {
      this.createUrl = `/2/topic/new?from=${from}&channelId=${channelId}`
    } else {
      this.createUrl = `/2/topic/new`
    }
    this.columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (text, record) => {
          return`${moment(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}`
        }
      },
      {
        title: '帖子内容',
        dataIndex: 'partContent',
        key: 'partContent',
        width: 200,
        render: (text, record, index) => {
          return (
            <Popover
              content={
                <Row>
                  <Row style={{padding: 10}}><span style={{marginRight: 20}}>标题:</span>{record.title}</Row>
                  <Row style={{padding: 10}}><span style={{marginRight: 20}}>描述:</span>{record.content}</Row>
                </Row>
              }>
                {record.partContent}
            </Popover>
          )
        }
      },
      {
        title: '配图',
        render: (text, record, index) => {
          if(record.url) {
            return (
              <img
                src={record.url}
                alt='图片加载失败'
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
        title: '点赞数',
        dataIndex: 'likes',
        key: 'likes',
      },
      {
        title: '留言数',
        dataIndex: 'comments',
        key: 'comments',
      },
      {
        title: '所属频道',
        dataIndex: 'channelTitle',
        key: 'channelTitle',
      },
      // {
      //   title: '浏览量',
      //   dataIndex: 'uniqueVisitor',
      //   key: 'uniqueVisitor',
      // },
      // {
      //   title: '所属学校',
      //   dataIndex: 'schoolName',
      //   key: 'schoolName',
      // },
      {
        title: '帖子状态',
        render: (text, record) => {
          return dict.topicStatus[record.status]
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          let detail, edit, comment, like
          let { from, cityId, channelId } = this.search

          if(from === 'city') {
            detail = <Link to={`/2/topic/detail/${record.id}?from=${from}&cityId=${cityId}`}>详情{'\u00A0'}|{'\u00A0'}</Link>
            edit = <Link to={`/2/topic/${record.id}?from=${from}&cityId=${cityId}`}>编辑{'\u00A0'}|{'\u00A0'}</Link>
            comment = <Link to={`/2/topic/${record.id}/comment?from=${from}&cityId=${cityId}`}>留言管理{'\u00A0'}|{'\u00A0'}</Link>
            like = <Link to={`/2/topic/${record.id}/like?from=${from}&cityId=${cityId}`}>点赞管理{'\u00A0'}|{'\u00A0'}</Link>
          } else if(from === 'channel') {
            detail = <Link to={`/2/topic/detail/${record.id}?from=${from}&channelId=${channelId}`}>详情{'\u00A0'}|{'\u00A0'}</Link>
            edit = <Link to={`/2/topic/${record.id}?from=${from}&channelId=${channelId}`}>编辑{'\u00A0'}|{'\u00A0'}</Link>
            comment = <Link to={`/2/topic/${record.id}/comment?from=${from}&channelId=${channelId}`}>留言管理{'\u00A0'}|{'\u00A0'}</Link>
            like = <Link to={`/2/topic/${record.id}/like?from=${from}&channelId=${channelId}`}>点赞管理{'\u00A0'}|{'\u00A0'}</Link>
          } else {
            detail = <Link to={`/2/topic/detail/${record.id}`}>详情{'\u00A0'}|{'\u00A0'}</Link>
            edit = <Link to={`/2/topic/${record.id}`}>编辑{'\u00A0'}|{'\u00A0'}</Link>
            comment = <Link to={`/2/topic/${record.id}/comment`}>留言管理{'\u00A0'}|{'\u00A0'}</Link>
            like = <Link to={`/2/topic/${record.id}/like`}>点赞管理{'\u00A0'}|{'\u00A0'}</Link>
          }

          return (
            <span>
              {detail}
              {edit}
              {comment}
              {like}
              <a href='javascript:void(0)' onClick={ this.show.bind(this, record) }>移动帖子{'\u00A0'}|</a>
              {
                (() => {
                  if(record.status === 0 || record.status === 1 || record.status === 2) {
                    return <a href='javascript:void(0)' onClick={ this.updateStatus.bind(this,record.id,3) }>{'\u00A0'}下线</a>
                  }
                  if(record.status === 3 || record.status === 4) {
                    return <a href='javascript:void(0)' onClick={ this.updateStatus.bind(this,record.id,0) }>{'\u00A0'}上线</a>
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
    const url = transformUrl(location.search)
    if( !url.channelId ) {
      delete url.channelId
    }
    if( !url.status ) {
      delete url.status
    }
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.props.dispatch({
      type: 'topic/channelList',
      payload: {
        data: {
          pagination: false
        }
      }
    })
    this.fetch(url)
  }
  fetch = (url) => {
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
        const url = transformUrl(location.search)
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
    const url = transformUrl(location.search)
    const self = this
    if(status === 3 ) {
      confirm({
        title: '下架帖子?',
        content: '下架后该帖子将不会再展示在C端，确认下架吗？',
        onOk() {
          self.props.dispatch({
            type: 'topic/updateStatus',
            payload: {
              id,
              data: {
                status
              },
              url
            }
          })
        }
      })
    } else {
      this.props.dispatch({
        type: 'topic/updateStatus',
        payload: {
          id,
          data: {
            status
          },
          url
        }
      })
    }
  }
  changeHandler = (type, value) => {
    if(value) {
      this.search = { ...this.search, [type]: trim(value) }
    } else {
      delete this.search[type]
    }
  }
  selectHandler =  (type, value) => {
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: {
          [type]: value
        }
      }
    })
    if(!value) {
      value = ''
    }
    this.search = { ...this.search, [type]: value }
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
   this.fetch(url)
  }
  renderStatus = (data) => {
    let item = []
    for( let key in data ) {
      item.push(<Option value={key} key={key}>{data[key]}</Option>)
    }
    return item
  }
  createTopic = () => {
    this.props.history.push(this.createUrl)
  }
  render() {
    const { form: { getFieldDecorator }, common: { search }, topic: { data: { objects, pagination }, record, key, visible, previewVisible, previewImage, channel }, loading  } = this.props
    let breadItems
    if(this.search.from === 'city') {
      breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '城市管理',
          url: `/2/city`
        },
        {
          title: '帖子管理'
        }
      ]
    } else if(this.search.from === 'channel') {
      breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '频道管理',
          url: `/2/channel`
        },
        {
          title: '帖子管理'
        }
      ]
    } else {
      breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '帖子管理'
        }
      ]
    }
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <InputWithClear
          placeholder='帖子发布人'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.name}
         />
        <InputWithClear
          placeholder='帖子关键字'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'keywords')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.keywords}
         />
        <InputWithClear
          placeholder='帖子学校'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'schoolName')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.schoolName}
         />
        <Select
          value={ search.channelId }
          allowClear
          className={styles.input}
          placeholder='帖子频道'
          onChange={this.selectHandler.bind('this','channelId')}>
            {
              channel.map(value => {
                return (
                  <Option value={value.id + ''} key={value.id}>{value.title}</Option>
                )
              })
            }
        </Select>
        <Select
          value={search.status}
          allowClear
          className={styles.input}
          placeholder='帖子状态'
          onChange={this.selectHandler.bind('this','status')}>
            { this.renderStatus(dict.topicStatus) }
        </Select>
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            筛选
          </Button>
          <Button
            type='primary'
            onClick={this.createTopic}
            style={{marginBottom: 20, marginRight: 20 }}>
              新建帖子
          </Button>
        </span>
        <DataTable
          scroll={{ x: 1000 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
          rowClassName={() => {}}
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
              <span>{record.title}</span>
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
                  {
                    channel.map(value => {
                      if(value.status === 0 || value.id === 0) {
                        return (
                          <Option value={value.id + ''} key={value.id}>{value.title}</Option>
                        )
                      }
                    })
                  }
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>
        <Modal visible={previewVisible} footer={null} onCancel={this.hide}>
          <img alt="图片加载失败" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'topic/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    topic: state.topic,
    common: state.common,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Topic))
