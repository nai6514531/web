import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Upload, Icon, Modal, Radio, AutoComplete, Select, InputNumber, Row, Col } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../../constant/api'
import { storage } from '../../../../utils/storage.js'
import { transformUrl, toQueryString } from '../../../../utils/'
import { trim, debounce } from 'lodash'
import moment from 'moment'
import emoji from 'node-emoji'

const { TextArea } = Input
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Option = Select.Option
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

class CommentEdit extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    const id = this.props.match.params.id
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
          url: `/2/topic/${id}/comment?cityId=${cityId}&from=${from}`
        },
        {
          title: '新建留言'
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
          url: `/2/topic/${id}/comment?channelId=${channelId}&from=${from}`
        },
        {
          title: '新建留言'
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
          url: `/2/topic/${id}/comment`
        },
        {
          title: '新建留言'
        }
      ]
    }
  }
  componentDidMount() {
    const id = this.props.match.params.id
    this.props.dispatch({
      type: 'commentEdit/topic',
      payload: {
        data: id
      }
    })
    this.props.dispatch({
      type: 'commentEdit/userList',
      payload: {
        data: {
          pagination: false,
          isOfficial: 1,
          setFieldsValue: this.props.form.setFieldsValue
        }
      }
    })
  }
  cancelHandler = () => {
    this.props.history.goBack()
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      const { match: { params: { id } }, history } = this.props
      if(!err) {
        let type = 'commentEdit/add'
        values.userId = Number(values.userId)
        // values.status = Number(values.status)
        values.content = emoji.unemojify(values.content)
        values.topicId = Number(id)
        this.props.dispatch({
          type: type,
          payload: {
            history,
            data: values,
            id
          }
        })
      }
    })
  }
  getRandomUser  = () => {
    this.props.dispatch({
      type: 'commentEdit/getRandomUser',
      payload: {
        data: {
          setFieldsValue: this.props.form.setFieldsValue
        }
      }
    })
  }
  render() {
    const { commentEdit: { toUser, userData, disabled }, form: { getFieldDecorator, getFieldProps }, loading } = this.props
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
            <Row>
              <Col span={20}>
                {getFieldDecorator('userId', {
                  rules: [{
                    required: true, message: '请选择发布人',
                  }]
                })(
                  <Select
                    placeholder='发布人'
                    disabled
                    >
                    {
                      userData.map((value) => {
                        return <Option value={value.id + ''} key={value.id}>{value.name}</Option>;
                      })
                    }
                  </Select>
                )}
              </Col>
              <Col span={4} style={{textAlign: 'right'}}>
                <Button onClick={this.getRandomUser}>刷新</Button>
              </Col>
            </Row>
          </FormItem>
          {/* <FormItem
            {...formItemLayout}
            label='回复状态'
          >
            {getFieldDecorator('status', {
              rules: [{
                required: true, message: '请选择帖子状态',
              }],
              initialValue:'1'
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
    this.props.dispatch({ type: 'commentEdit/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    commentEdit: state.commentEdit,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(CommentEdit))
