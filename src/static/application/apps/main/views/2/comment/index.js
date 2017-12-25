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
import styles from '../../../assets/css/search-bar.pcss'
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

class Comment extends Component {
  constructor(props) {
    super(props)
    this.search = transformUrl(location.search)
    let { from, cityId, channelId } = this.search
    this.topicId = this.props.match.params.id
    if(from === 'city') {
      this.breadItems = [
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
          title: '留言管理'
        }
      ]
      this.createUrl = `/2/topic/${this.topicId}/comment/new?from=${from}&cityId=${cityId}`
    } else if(from === 'channel') {
      this.breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '频道管理',
          url: `/2/channel`
        },
        {
          title: '帖子管理',
          url: `/2/topic/?channelId=${channelId}&from=${from}`
        },
        {
          title: '留言管理'
        }
      ]
      this.createUrl = `/2/topic/${this.topicId}/comment/new?from=${from}&channelId=${channelId}`
    } else {
      this.breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '帖子管理',
          url: `/2/topic`
        },
        {
          title: '留言管理'
        }
      ]
      this.createUrl = `/2/topic/${this.topicId}/comment/new`
    }

    this.columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '更新时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text, record) => {
          return`${moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}`
        }
      },
      {
        title: '留言内容',
        dataIndex: 'content',
        key: 'content',
        width: 200
      },
      {
        title: '用户昵称',
        dataIndex: 'user.name',
        key: 'user.name',
      },
      {
        title: '点赞数',
        dataIndex: 'likes',
        key: 'likes',
      },
      {
        title: '回复数',
        dataIndex: 'replies',
        key: 'replies',
      },
      {
        title: '留言状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => {
          return dict.two.commentStatus[record.status]
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          let comment, like
          let { from, cityId, channelId } = this.search
          if(from === 'city') {
            comment = <Link to={`/2/topic/${this.topicId}/comment/${record.id}/reply?from=${from}&cityId=${cityId}`}>回复管理{'\u00A0'}|{'\u00A0'}</Link>
            like = <Link to={`/2/topic/${this.topicId}/comment/${record.id}/like/?from=${from}&cityId=${cityId}`}>点赞管理{'\u00A0'}|{'\u00A0'}</Link>
          } else if(from === 'channel') {
            comment = <Link to={`/2/topic/${this.topicId}/comment/${record.id}/reply?from=${from}&channelId=${channelId}`}>回复管理{'\u00A0'}|{'\u00A0'}</Link>
            like = <Link to={`/2/topic/${this.topicId}/comment/${record.id}/like?from=${from}&channelId=${channelId}`}>点赞管理{'\u00A0'}|{'\u00A0'}</Link>
          } else {
            comment = <Link to={`/2/topic/${this.topicId}/comment/${record.id}/reply`}>回复管理{'\u00A0'}|{'\u00A0'}</Link>
            like = <Link to={`/2/topic/${this.topicId}/comment/${record.id}/like`}>点赞管理{'\u00A0'}|{'\u00A0'}</Link>
          }

          return (
            <span>
              {comment}
              {like}
              {
                (() => {
                  if(record.status === 0) {
                    return <a href='javascript:void(0)' onClick={ this.updateStatus.bind(this,record.id,1) }>{'\u00A0'}下线</a>
                  }
                  if(record.status !== 0) {
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
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.fetch(url)
  }
  fetch = (url) => {
    this.props.dispatch({
      type: 'comment/list',
      payload: {
        data: { ...url,  topicId: this.topicId }
      }
    })
  }
  updateStatus = (id, status) => {
    const url = transformUrl(location.search)
    const self = this
    if(status === 1 ) {
      confirm({
        title: '下线留言?',
        content: '删除后该话题及其点赞留言将消失，确定下线吗？',
        onOk() {
          self.props.dispatch({
            type: 'comment/updateStatus',
            payload: {
              id,
              data: {
                status
              },
              url: { ...url, topicId: self.topicId }
            }
          })
        }
      })
    } else {
      this.props.dispatch({
        type: 'comment/updateStatus',
        payload: {
          id,
          data: {
            status
          },
          url: { ...url, topicId: self.topicId }
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
  createComment = () => {
    this.props.history.push(this.createUrl)
  }
  render() {
    const { form: { getFieldDecorator }, common: { search }, comment: { data: { objects, pagination }, record, key, visible, previewVisible, previewImage, channel }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
        <Select
          value={ search.order }
          allowClear
          className={styles.input}
          placeholder='排序方式'
          onChange={this.selectHandler.bind('this','order')}>
            <Option value={'likes'} key={'1'}>按赞数排序</Option>
            <Option value={'id'} key={'2'}>按发布时间排序</Option>
        </Select>
        <span className={styles.input}>
          <InputWithClear
            placeholder='留言发布人'
            onChange={this.changeHandler.bind(this, 'name')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.name}
          />
        </span>
        <span className={styles.input}>
          <InputWithClear
            placeholder='留言关键字'
            onChange={this.changeHandler.bind(this, 'keywords')}
            onPressEnter={this.searchClick}
            defaultValue={this.search.keywords}
          />
        </span>
        <Button
          type='primary'
          onClick={this.searchClick}
          className={styles.button}
          >
          筛选
        </Button>
        <Button
          type='primary'
          onClick={this.createComment}
          className={styles.button}>
            新建留言
        </Button>
        <DataTable
          scroll={{ x: 1000 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
          rowClassName={() => {}}
        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'comment/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    comment: state.comment,
    common: state.common,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Comment))
