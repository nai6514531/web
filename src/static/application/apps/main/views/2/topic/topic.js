import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { trim } from 'lodash'
import { Select, Button, Popconfirm, Input, Modal, Form, Popover, Row, Col, DatePicker } from 'antd'
import { connect } from 'dva'

import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import { InputClear } from '../../../components/form/input'

import styles from '../../../assets/css/search-bar.pcss'
import dict from '../dict.js'

const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const RangePicker = DatePicker.RangePicker

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
    this.state = { from }
    this.columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        width: 70
      },
      {
        title: '创建时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (text, record) => {
          return`${moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}`
        }
      },
      {
        title: '帖子内容',
        dataIndex: 'partContent',
        key: 'partContent',
        width: 150,
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
        width: 90
      },
      {
        title: '留言数',
        dataIndex: 'comments',
        key: 'comments',
        width: 90
      },
      {
        title: '所属频道',
        render: (text, record, index) => {
          let channelTitle = record.channels.reduce((pre, current, currentIndex) => {
            let comma = currentIndex !== record.channels.length - 1 ? '、 ' : ''
            return `${pre}${current.title}${comma}`
          }, '')
          return channelTitle || '-'
        }
      },
      {
        title: '打分次数',
        dataIndex: 'grades',
        key: 'grades',
        width: 90
      },
      {
        title: '手机号',
        dataIndex: 'user.mobile',
        key: 'user.mobile',
      },
      {
        title: '帖子状态',
        width: 90,
        render: (text, record) => {
          return dict.topicStatus[record.status]
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          let detail, edit, comment, like
          let {  cityId, channelId } = this.search
          let { from } = this.state
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
              {/* <a href='javascript:void(0)' onClick={ this.show.bind(this, record) }>移动帖子{'\u00A0'}|</a> */}
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

    if( !url.status ) {
      delete url.status
    }
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.fetch(url)

    this.unlisten = this.props.history.listen((value) => {
      // hard code
      this.search = transformUrl(value.search)
      if(this.state.from !== this.search.from) {
        this.fetch(this.search)
      }
      this.setState({
        from: this.search.from
      })
    })
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
  changeHandler = (type, e) => {
    let val = e.target.value || ''

    if(val) {
      this.search = { ...this.search, [type]: trim(val) }
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
  timeChange = (value, dateString) => {
    let [ startAt, endAt ] = dateString
    if(startAt && endAt) {
      startAt = moment(startAt).format(dateFormat)
      endAt = moment(endAt).format(dateFormat)
      this.search = { ...this.search, startAt, endAt }
    } else {
      delete this.search.startAt
      delete this.search.endAt
    }
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
    const startAt = this.search.startAt ? moment(this.search.startAt, dateFormat) : null
    const endAt = this.search.endAt ? moment(this.search.endAt, dateFormat) : null
    let breadItems
    let { from } = this.state
    let { cityId, channelId } = this.search
    if(from === 'city') {
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
    } else if(from === 'channel') {
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
        {
          from !== 'channel' ?
          <span>
            <span className={styles.input}>
              <InputClear
                placeholder='帖子发布人'
                onChange={this.changeHandler.bind(this, 'name')}
                onPressEnter={this.searchClick}
                defaultValue={this.search.name}
              />
            </span>
            <span className={styles.input}>
              <InputClear
                placeholder='帖子关键字'
                onChange={this.changeHandler.bind(this, 'keywords')}
                onPressEnter={this.searchClick}
                defaultValue={this.search.keywords}
                />
            </span>
            <span className={styles.input}>
              <InputClear
                placeholder='帖子学校'
                onChange={this.changeHandler.bind(this, 'schoolName')}
                onPressEnter={this.searchClick}
                defaultValue={this.search.schoolName}
                />
            </span>
            <RangePicker
              className={styles['date-picker-wrap']}
              showTime
              defaultValue={[startAt,endAt]}
              format={dateFormat}
              onChange={this.timeChange}
              showTime={{
                hideDisabledOptions: true,
                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
              }} />
            <Select
              value={search.status}
              allowClear
              className={styles.input}
              placeholder='帖子状态'
              onChange={this.selectHandler.bind('this','status')}>
                { this.renderStatus(dict.topicStatus) }
            </Select>
            <Button
              type='primary'
              onClick={this.searchClick}
              className={styles.button}
              >
              筛选
            </Button>
            <Button
              type='primary'
              className={styles.button}>
              <Link to={`/2/topic/new?from=${from}&cityId=${cityId || ''}&channelId=${channelId || ''}`}>
                新建帖子
              </Link>
            </Button>
          </span>
          : null
        }
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
    this.unlisten()
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
