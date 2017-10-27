import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Modal } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import history from '../../../utils/history.js'


const confirm = Modal.confirm
const breadItems = [
  {
    title: '闲置系统'
  },
  {
    title: '频道管理'
  }
]

class Channel extends Component {
  constructor(props) {
    super(props)
    this.columns = [
      { title: '排序', dataIndex: 'order', key: 'order' },
      { title: '频道名称', dataIndex: 'title',key: 'title' },
      { title: '已上架商品数', dataIndex: 'onSaleCount',key: 'onSaleCount' },
      { title: '处于交易中的商品数', dataIndex: 'tradingCount', key: 'tradingCount' },
      // { title: '待确认上架商品数', dataIndex: 'b',key: 'b' },
      {
        title: '频道状态',
        render: (text, record) => {
          return record.status === 0 ? '正常' : '已下架'
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          let operate = record.status == 1
                        ? <a href='javascript:void(0)' onClick={ this.upDateChannelStatus.bind(this,record.id,0) }>上架</a>
                        : <a href='javascript:void(0)' onClick={ this.upDateChannelStatus.bind(this,record.id,1) }>下架</a>
          return (
            <span>
              <Link to={`/2/channel/detail/${record.id}`}>详情 | </Link>
              <Link to={`/2/channel/${record.id}`}>编辑  | </Link>
              <Link to={`/2/topic?channelId=${record.id}&from=channel`}>商品管理  | </Link>
              {operate}
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    const url = transformUrl(location.search)
    this.fetch(url)
  }
  upDateChannelStatus = (id, status) => {
    const url = transformUrl(location.search)
    const self = this
    if(status === 1 ) {
      confirm({
        title: '下架频道?',
        content: '下架频道后该频道不会再在首页出现，确认下架吗?',
        onOk() {
          self.props.dispatch({
            type: 'channel/upDateChannelStatus',
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
        type: 'channel/upDateChannelStatus',
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
  fetch = (url) => {
    this.props.dispatch({
      type: 'channel/list',
      payload: {
        data: url
      }
    })
  }
  change = (url) => {
   this.fetch(url)
  }
  render() {
    const { channel: { data: { objects, pagination } }, loading  } = this.props
    pagination && (pagination.showSizeChanger = true)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Link
          to={`/2/channel/new`}>
          <Button
            type='primary'
            style={{marginBottom: '20px', marginRight: '20px'}}
            >
          新增频道
          </Button>
        </Link>
        <Link
          to={`/2/channel/order`}>
          <Button
            type='primary'
            style={{marginBottom: '20px'}}
            >
          频道排序
          </Button>
        </Link>
        <DataTable
          dataSource={objects}
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
    this.props.dispatch({ type: 'channel/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    channel: state.channel,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Channel)
