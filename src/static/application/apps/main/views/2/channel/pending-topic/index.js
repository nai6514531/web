import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { Select, Button, Popconfirm, Input, Modal, Form, Popover, Row, Col, Badge } from 'antd'
import { connect } from 'dva'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import moment from 'moment'
import history from '../../../../utils/history.js'
import styles from './index.pcss'

const confirm = Modal.confirm
const status =  {
  0: '正常',
  1: '交易中',
  2: '交易完成',
  3: '违规下架',
  4: '已下架'
}
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
class Topic extends Component {
  constructor(props) {
    super(props)
    let search = transformUrl(location.search)
    let { id } = this.props.match.params
    if(id) {
      search = { ...search, channelId: id}
    }
    this.search = search
    this.breadItems = [
      {
        title: '闲置系统'
      },
      {
        title: '频道管理',
        url: `/2/channel`
      },
      {
        title: '商品管理',
        url: `/2/channel/${id}/topic`
      },
      {
        title: '待处理商品管理',
      }
    ]
    this.columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
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
                    type: 'channelTopic/showImageModal',
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
        title: '商品详情',
        dataIndex: 'title',
        key: 'title',
        render: (text, record, index) => {
          return (
            <Popover
              content={
                <Row>
                  <Row style={{padding: 10}}><span style={{marginRight: 20}}>标题:</span>{record.title}</Row>
                  <Row style={{padding: 10}}><span style={{marginRight: 20}}>描述:</span>{record.content}</Row>
                </Row>
              }>
                {record.title}
            </Popover>
          )
        }
      },
      {
        title: '所属频道',
        dataIndex: 'channelTitle',
        key: 'channelTitle',
      },
      {
        title: '浏览量',
        dataIndex: 'uniqueVisitor',
        key: 'uniqueVisitor',
      },
      {
        title: '所属学校',
        dataIndex: 'schoolName',
        key: 'schoolName',
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
              <Link to={`/2/topic/${record.id}?from=pending`}>查看详情{'\u00A0'}|{'\u00A0'}</Link>
              <a href='javascript:void(0)' onClick={ this.show.bind(this, record.id) }>加入频道{'\u00A0'}|{'\u00A0'}</a>
              <a href='javascript:void(0)' onClick={ this.show.bind(this, record.id) }>不符合{'\u00A0'}|</a>
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
    const url = this.search
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
      type: 'channelTopic/list',
      payload: {
        data: url
      }
    })
  }
  show = (id) => {
    const self = this
    confirm({
      title: '确认将商品加入该频道?',
      onOk() {
        self.props.dispatch({
          type: 'channelTopic/moveTopic',
          payload: {
            id,
            url: self.search,
            data: {
              channelId: self.props.match.params.id
            }
          }
        })
      }
    })
  }
  updateStatus = (id, status) => {
    const url = transformUrl(location.search)
    this.props.dispatch({
      type: 'channelTopic/updateStatus',
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
  hide = () => {
    this.props.dispatch({
      type: 'channelTopic/hideModal',
    })
  }
  render() {
    const { match: { params: { id } }, form: { getFieldDecorator }, common: { search }, channelTopic: { data: { objects, pagination }, record, key, previewVisible, previewImage, channel }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={this.breadItems} />
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
          rowClassName={() => {}}
        />
        <Modal visible={previewVisible} footer={null} onCancel={this.hide}>
          <img alt="图片加载失败" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'channelTopic/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    channelTopic: state.channelTopic,
    common: state.common,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Topic))
