import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, InputNumber, Select } from 'antd'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../utils/debug.js'
import { storage } from '../../../utils/storage.js'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'

const Option = Select.Option
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'

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

class TopicLikes extends Component {
  constructor(props) {
    super(props)
    this.search = transformUrl(location.search)
    let { from, cityId, channelId } = this.search
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
          title: '点赞管理'
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
          title: '点赞管理'
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
          title: '点赞管理'
        }
      ]
    }
  }
  componentDidMount() {
    const id = this.props.match.params.id
    this.props.dispatch({
      type: 'likes/topic',
      payload: {
        data: id
      }
    })
    this.props.dispatch({
      type: 'likes/list',
      payload: {
        data: {
          topicId: id,
          isRobot: 0,
          status: 0
        }
      }
    })
    this.props.dispatch({
      type: 'likes/list',
      payload: {
        data: {
          topicId: id,
          isRobot: 1,
          status: 0
        }
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { history } = this.props
      const id = Number(this.props.match.params.id)
      if(!err) {
        this.props.dispatch({
          type: 'likes/batchLike',
          payload: {
            history,
            data: {
              topicId: id,
              count: values.likes,
              targetType: 'topic'
            }
          }
        })
      }
    })
  }
  cancelHandler = () => {
    this.props.history.goBack()
  }
  render() {
    const { likes: { realLikes, virtualLikes, content, maxLikes }, form: { getFieldDecorator, getFieldProps }, loading } = this.props
    return(
      <Spin spinning={loading}>
        <Breadcrumb items={this.breadItems} />
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            {...formItemLayout}
            label='帖子内容'
          >
            {getFieldDecorator('content', {
              rules: [{
                required: true, message: '请输入帖子内容',
              }],
              initialValue: content || '无'
            })(
              <Input placeholder='帖子内容' disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='真实点赞数'
          >
            {getFieldDecorator('realLikes', {
              rules: [{
                required: true, message: '请输入真实点赞数',
              }],
              initialValue: realLikes
            })(
              <Input placeholder='真实点赞数' disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='马甲点赞数'
          >
            {getFieldDecorator('virtualLikes', {
              rules: [{
                required: true, message: '请输入马甲点赞数',
              }],
              initialValue: virtualLikes
            })(
              <Input placeholder='马甲点赞数' disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='增加赞数'
          >
            {getFieldDecorator('likes', {
              rules: [{
                required: true, message: '请输入赞数',
              }]
            })(
              <InputNumber
                min={1}
                max={maxLikes}
                style={{width: '200px'}}
                disabled={!maxLikes}
                placeholder={`最多输入${maxLikes}个`}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="赞数分配规则"
          >
            {getFieldDecorator('rules', {
              rules: [{
                required: true, message: '请选择赞数分配规则',
              }],
              initialValue: '1'
            })(
              <Select>
                <Option value={'1'} key={'1'}>随机分配</Option>
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
    this.props.dispatch({ type: 'likes/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    likes: state.likes,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(TopicLikes))
