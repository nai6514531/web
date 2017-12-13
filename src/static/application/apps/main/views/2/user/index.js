import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal, Form, Input, Checkbox, Col, Row, Select } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import { map } from 'lodash'
import history from '../../../utils/history.js'
import styles from './index.pcss'
import moment from 'moment'
import dict from '../../../utils/dict'

const Search = Input.Search
const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const formItemLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 10 },
}
const breadItems = [
  {
    title: '闲置系统'
  },
  {
    title: '用户管理'
  }
]

class TwoUser extends Component {
  constructor(props) {
    super(props)
    this.search = transformUrl(location.search)
    this.columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '头像',
        render: (text, record, index) => {
          if(record.avatorUrl) {
            return (
              <img
                src={record.avatorUrl}
                alt='图片加载失败'
                style={{ width: '50px', height: '30px' }}
                onClick={() => {
                  this.props.dispatch({
                    type: 'twoUser/showImageModal',
                    payload: {
                      previewImage: record.avatorUrl
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
        title: '昵称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '学校',
        dataIndex: 'schoolName',
        key: 'schoolName',
      },
      {
        title: '用户类型',
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => {
          return dict.two.userType[record.isOfficial]
        }
      },
      {
        title: '状态',
        render: (text, record) => {
          return dict.two.userStatus[record.status]
        }
      },{
        title: '手机号',
        dataIndex: 'mobile',
        key: 'mobilem',
      },
      {
        title: '注册时间',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (text, record) => {
          return`${moment(record.created_at).format('YYYY-MM-DD HH:mm:ss')}`
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          const edit = record.isOfficial === 1 ? <Link to={`/2/users/${record.id}`}>{'\u00A0'}编辑 |</Link> : null
          return (
            <span>
              <Link to={`/2/users/detail/${record.id}`}>详情</Link> |
              { edit }
              {
                (() => {
                  if(record.status === 0) {
                    return <a href='javascript:void(0)' onClick={ this.updateStatus.bind(this,record.id,1) }>{'\u00A0'}拉黑</a>
                  }
                  if(record.status === 1) {
                    return <a href='javascript:void(0)' onClick={ this.updateStatus.bind(this,record.id,0) }>{'\u00A0'}取消拉黑</a>
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
    const url = this.search
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    this.fetch(url)
  }
  fetch = (params) => {
    this.props.dispatch({
      type: 'twoUser/list',
      payload: {
        data: params
      }
    })
  }
  delete = (id) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'twoUser/delete',
      payload: {
        data: url,
        id: id
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'twoUser/hideModal',
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
    history.push(`${location.pathname}?${queryString}`)
    this.fetch(this.search)
  }
  change = (url) => {
   this.fetch(url)
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
    if(value) {
      this.search = { ...this.search, [type]: value }
    } else {
      delete this.search[type]
    }
  }
  updateStatus = (id, status) => {
    const url = transformUrl(location.search)
    const self = this
    if(status === 1 ) {
      confirm({
        title: '拉黑用户?',
        content: '拉黑后该用户点赞及其留言将消失，确定拉黑吗？',
        onOk() {
          self.props.dispatch({
            type: 'twoUser/updateStatus',
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
        type: 'twoUser/updateStatus',
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
  render() {
    const { common: { search }, form: { getFieldDecorator }, twoUser: { data: { objects, pagination }, key, previewVisible, previewImage }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Select
          value={search.isOfficial}
          allowClear
          className={styles.input}
          placeholder='类型'
          onChange={this.selectHandler.bind('this','isOfficial')}>
          {
            map(dict.two.userType, (val, key) => {
              return (
                <Option value={key} key={key}>{val}</Option>
              )
            })
          }
        </Select>
        <Select
          value={search.status}
          allowClear
          className={styles.input}
          placeholder='状态'
          onChange={this.selectHandler.bind('this','status')}>
            {
              map(dict.two.userStatus, (val, key) => {
                return (
                  <Option value={key} key={key}>{val}</Option>
                )
              })
            }
        </Select>
        <Input
          placeholder='学校'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'schoolName')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.schoolName}
         />
        <Input
          placeholder='昵称'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'name')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.name}
         />
        <Input
          placeholder='手机号'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'mobile')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.mobile}
         />
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            搜索
          </Button>
          <Link
            to={`/2/users/new`}>
            <Button
              type='primary'
              style={{marginBottom: 20, marginRight: 20 }}>
                添加用户
            </Button>
          </Link>
        </span>
        <DataTable
          scroll={{ x: 700 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
        <Modal visible={previewVisible} footer={null} onCancel={this.hide}>
          <img alt="图片加载失败" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'twoUser/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    common: state.common,
    twoUser: state.twoUser,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(TwoUser))

