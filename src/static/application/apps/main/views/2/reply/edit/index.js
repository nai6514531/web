import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Upload, Icon, Modal, Radio, AutoComplete, Select, InputNumber } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../../utils/debug.js'
import { storage } from '../../../../utils/storage.js'
import { transformUrl, toQueryString } from '../../../../utils/'
import { trim, debounce } from 'lodash'
import moment from 'moment'

const { TextArea } = Input
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
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

class ReplyEdit extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    const topicId = this.props.match.params.topicId
    const commentId = this.props.match.params.commentId
    const { from, cityId, channelId } = this.search
    if(from == 'city') {
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
          title: '留言管理',
          url: `/2/topic/${topicId}/comment?cityId=${cityId}&from=${from}`
        },
        {
          title: '回复管理',
          url: `/2/topic/${topicId}/comment/${commentId}/reply?cityId=${cityId}&from=${from}`
        },
        {
          title: '新建回复'
        }
      ]
    } else if(from == 'channel') {
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
          url: `/2/topic?channelId=${channelId}&from=${from}`
        },
        {
          title: '留言管理',
          url: `/2/topic/${topicId}/comment?channelId=${channelId}&from=${from}`
        },
        {
          title: '回复管理',
          url: `/2/topic/${topicId}/comment/${commentId}/reply?channelId=${channelId}&from=${from}`
        },
        {
          title: '新建回复'
        }
      ]
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
          title: '留言管理',
          url: `/2/topic/${topicId}/comment`
        },
        {
          title: '回复管理',
          url: `/2/topic/${topicId}/comment/${commentId}/reply`
        },
        {
          title: '新建回复'
        }
      ]
    }
  }
  componentDidMount() {
    const { match: { params: { commentId } } } = this.props
    this.props.dispatch({
      type: 'replyEdit/comment',
      payload: {
        data: commentId
      }
    })
  }
  cancelHandler = () => {
    this.props.history.goBack()
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { match: { params: { commentId } }, history } = this.props
      if(!err) {
        values.userId = Number(values.userId)
        // values.status = Number(values.status)
        values.commentId = Number(commentId)
        this.props.dispatch({
          type: 'replyEdit/add',
          payload: {
            history,
            data: values
          }
        })
      }
    })
  }
  handleSelect = () => {
    this.props.dispatch({
      type: 'replyEdit/updateData',
      payload: {
        disabled: false
      }
    })
  }
  handleSearch = (filterKey) => {
    if(filterKey) {
      this.props.dispatch({
        type: 'replyEdit/updateData',
        payload: {
          disabled: true
        }
      })
      this.props.dispatch({
        type: 'replyEdit/userList',
        payload: {
          data: {
            name: filterKey,
            pagination: false,
            isOfficial: 1
          }
        }
      })
    } else {
      this.props.dispatch({
        type: 'replyEdit/updateData',
        payload: {
          disabled: false
        }
      })
    }
  }
  debounceSearch = _.debounce((filterKey) => {
      return this.handleSearch(filterKey)
  }, 1000)
  render() {
    const { replyEdit: { toUser, userData, disabled }, form: { getFieldDecorator, getFieldProps }, loading } = this.props

    return(
      <Spin spinning={loading}>
        <Breadcrumb items={this.breadItems} />
        <Form onSubmit={this.handleSubmit}>
        <FormItem
            {...formItemLayout}
            label='留言对象'
          >
            {getFieldDecorator('toUser', {
              rules: [{
                required: true, message: '请输入10字以内的昵称',
              }],
              initialValue: toUser
            })(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='内容'
          >
            {getFieldDecorator('content', {
              rules: [{
                required: true, message: '请输入50字以内的留言内容',
              },{
                max: 50, message: '长度最多50个字符'
              }]
            })(
              <Input placeholder='请输入50字以内'/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="发布人"
          >
            {getFieldDecorator('userId', {
              rules: [{
                required: true, message: '请选择发布人',
              }]
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
          {/* <FormItem
            {...formItemLayout}
            label='回复状态'
          >
            {getFieldDecorator('status', {
              rules: [{
                required: true, message: '请选择帖子状态',
              }],
              initialValue: '1'
            })(
              <RadioGroup>
                <Radio value={'0'}>线上</Radio>
                <Radio value={'1'}>线下</Radio>
              </RadioGroup>
            )}
          </FormItem> */}
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
              onClick={this.handleSubmit}
              disabled={disabled}>
              保存
            </Button>
          </FormItem>
        </Form>
      </Spin>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'replyEdit/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    replyEdit: state.replyEdit,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(ReplyEdit))
