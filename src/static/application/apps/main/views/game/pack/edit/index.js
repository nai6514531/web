import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Spin, Message, Form, Input, Button, Select, DatePicker, Col, Upload, Icon, Modal, message } from 'antd'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { API_SERVER } from '../../../../utils/debug.js'
import { trim } from 'lodash'
import moment from 'moment'
import gameService from '../../../../services/game/game'
import { storage } from '../../../../utils/storage.js'


const RangePicker = DatePicker.RangePicker
const { Option } = Select
const FormItem = Form.Item
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
const fileServer = `${API_SERVER}/game/packs/import`
const excelType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

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

class PackEdit extends Component {
  constructor(props) {
    super(props)
    this.state = {
      games: [],
      absPath: '',
    }
  }
  componentDidMount() {
    const { match: { params: { id } } } = this.props
    id !== 'new' && this.props.dispatch({
      type: 'pack/detail',
      payload: {
        id: id
      }
    })
    this.games();
  }
  games = () => {
    const self = this;
    gameService.list().then(function(result){
      if(result.status == 'OK') {
        self.setState((prevState, props) => {
          return { games: result.data.objects };
        });
      } else {
        result.message && message.error(result.message)
      }
    })
  }
  beforeUpload(file) {
    const isExcel = file.type === excelType;
    if (!isExcel) {
      message.error('只能上传以 .xlsx 为后缀名的文件');
    }
    return isExcel 
  }
  handleChange(info) {
    if (info.file.status === 'done') {
      if (info.file.response.status == 'OK') {
        message.success(`${info.file.name} 文件上传成功`);        
        this.setState({
          absPath: info.file.response.data
        })
      } else {
        message.error(`${info.file.name} 文件上传失败`);        
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        const { match: { params: { id } }, history } = this.props
        let type = 'pack/add'
        if(id !== 'new') {
          type = 'pack/update'
        }
        values.gameId = Number(trim(values.gameId))
        values.name = trim(values.name) 
        values.profile = trim(values.profile) 
        values.description = trim(values.description)      
        values.status = Number(trim(values.status))
        values.absPath = trim(this.state.absPath)  
        values.startedAt = moment(values.time[0],moment.ISO_8601).format()
        values.endedAt = moment(values.time[1],moment.ISO_8601).format()

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
  trim = ( description, rule, value, callback) => {
    const result = !trim(value)
    if ( result && value != '' ) {
      callback(description)
    } else {
      callback()
    }
  }
  render() {
    const { pack: { detail }, form: { getFieldDecorator, getFieldProps }, match: { params: { id } }, loading } = this.props
    const isEdit = this.props.match.params.id !== 'new'
    const { startedAt, endedAt, gameList } = detail   
    const breadItems = [
      {
        title: '礼包管理'
      },
      {
        title: '新增/编辑礼包',
        url: '/game/pack'
      },
      {
        title: isEdit ? '编辑' : '添加'
      }
    ]
    return(
      <Spin spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Form onSubmit={this.handleSubmit}>
            <FormItem
                {...formItemLayout}
                label='游戏'
              >
              {getFieldDecorator('gameId', {
                rules: [{
                  required: true, message: '请选择游戏',
                }],
                initialValue: gameList && gameList.length > 0 && gameList[0].id !== undefined ? gameList[0].id + '' : undefined
                
              })(
                <Select
                  showSearch
                  allowClear
                  placeholder="请选择游戏"
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                   {
                    this.state.games.map(value => {
                      return (
                        <Option value={value.id + ''} key={value.id}>{value.title}</Option>
                      )
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem
                {...formItemLayout}
                label='礼包名称'
            >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入20字以内的礼包名',
              },{
                max: 20, message: '长度最多20个字符'
              }],
              initialValue: detail.name
            })(
              <Input placeholder='请输入礼包名' />              
            )}
          </FormItem>
          <FormItem
             label='有效期'
             {...formItemLayout}
             required
           >
            {getFieldDecorator('time', {
              rules: [{
                type: 'array', required: true, message: '有效期'
              }],
              initialValue: (startedAt && endedAt) ? [ moment(startedAt, dateFormat), moment(endedAt, dateFormat) ]: undefined
            })(
              <RangePicker
                showTime
                format={dateFormat}
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label='礼包状态'
          >
            {getFieldDecorator('status', {
              rules: [{
                required: true, message: '请选择礼包状态',
              }],
              initialValue: detail.status !== undefined ? detail.status + '' : '1'
            })(
              <Select placeholder='请选择礼包状态'>
                <Option value={'0'}>上架</Option>
                <Option value={'1'}>下架</Option>
              </Select>
            )}
          </FormItem>
          { !isEdit ? <FormItem
                {...formItemLayout}
                label='CDK'
            >
            {getFieldDecorator('absPath', {
               rules: [{
                required: true, message: '请上传文件',
              }],
              initialValue: this.state.absPath
            })(
              <Upload  
                action={fileServer}
                name='uploadExcel'
                onChange={this.handleChange.bind(this)}
                beforeUpload={this.beforeUpload.bind(this)}
                headers={{ Authorization: 'Bearer ' + (storage.val('token') || '') }}
                withCredentials={true}>
                <Button>
                  <Icon type="upload" /> 请上传 .xlsx 文档
                </Button>
              </Upload>
            )}
          </FormItem>:""}
          { isEdit ? <FormItem
                {...formItemLayout}
                label='总库存'
            >
            {getFieldDecorator('contact', {
              initialValue: detail.count
            })(
              <Input placeholder='请输入总库存' disabled/>
            )}
          </FormItem> : '' }
          { isEdit ? <FormItem
                {...formItemLayout}
                label='剩余库存'
            >
            {getFieldDecorator('contact', {
              initialValue: detail.restCount
            })(
              <Input placeholder='请输入剩余库存' disabled/>
            )}
          </FormItem> : '' }
          <FormItem
                {...formItemLayout}
                label='礼包内容'
            >
            {getFieldDecorator('description', {
              rules: [{
                required: true, message: '请输入50字以内的礼包内容',
              },{
                max: 50, message: '长度最多50个字符'
              }],
              initialValue: detail.description
            })(
              <Input type="textarea"  placeholder='请输入礼包内容'/>
            )}
          </FormItem>
          <FormItem
                {...formItemLayout}
                label='使用说明'
            >
            {getFieldDecorator('profile', {
              rules: [{
                required: true, message: '请输入200字以内的使用说明',
              },{
                max: 200, message: '长度最多200个字符'
              }],
              initialValue: detail.profile
            })(
              <Input type="textarea"  placeholder='请输入使用说明'/>
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
    this.props.dispatch({ type: 'pack/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    pack: state.pack,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(PackEdit))
