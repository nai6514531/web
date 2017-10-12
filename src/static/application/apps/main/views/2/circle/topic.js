import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Select, Button, Popconfirm, Input, Modal, Form } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import history from '../../../utils/history.js'
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
    title: '城市管理',
    url: `/2/circle`
  },
  {
    title: '商品管理'
  }
]
class Topic extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    // 搜索时跳到默认分页
    // delete search.page
    // delete search.per_page
    this.search = search
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
        render: (text, record, index) => {
          return moment(record.createdAt).format('YYYY-MM-DD HH:mm')
        }
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
        render: (text, record) => {
          return status[record.status]
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={`/2/topic/${record.id}`}>查看详情{'\u00A0'}|{'\u00A0'}</Link>
              <a href='javascript:void(0)' onClick={ this.show.bind(this, record) }>移动频道{'\u00A0'}|</a>
              {
                (() => {
                  if(record.status === 0 || record.status === 1 || record.status === 2) {
                    return (
                      <Popconfirm title={`是否确定要下架该商品`} onConfirm={ this.updateStatus.bind(this,record.id,4) } >
                        <a href='javascript:void(0)'>{'\u00A0'}下架商品</a>
                      </Popconfirm>
                    )
                  }
                  if(record.status === 3 || record.status === 4) {
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
    history.push(`${location.pathname}?${queryString}`)
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
  render() {
    const { form: { getFieldDecorator }, common: { search }, topic: { data: { objects, pagination }, record, key, visible, previewVisible, previewImage, channel }, loading  } = this.props
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
          onChange={this.changeHandler.bind(this, 'keywords')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.keywords}
         />
        <Input
          placeholder='商品学校'
          className={styles.input}
          onChange={this.changeHandler.bind(this, 'schoolName')}
          onPressEnter={this.searchClick}
          defaultValue={this.search.schoolName}
         />
        <Select
          value={ search.channelId }
          allowClear
          className={styles.input}
          placeholder='商品频道'
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
            筛选
          </Button>
        </span>
        <DataTable
          scroll={{ x: 1000 }}
          dataSource={objects || []}
          columns={this.columns}
          loading={loading}
          pagination={pagination}
          change={this.change}
        />
        <Modal
          title={`商品频道`}
          visible={visible}
          onCancel={this.hide}
          onOk={this.handleSubmit}
          key={key}
         >
          <Form onSubmit={this.handleSubmit}>
            <FormItem
              {...formItemLayout}
              label='商品名称'
            >
              <span>{record.title}</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='当前商品频道'
            >
              <span>{record.channelTitle}</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label='将商品移动至'
            >
              {getFieldDecorator('channelId', {
                rules: [{
                  required: true, message: '必填项!',
                }]
              })(
                <Select allowClear>
                  {
                    channel.map(value => {
                      return (
                        <Option value={value.id + ''} key={value.id}>{value.title}</Option>
                      )
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
