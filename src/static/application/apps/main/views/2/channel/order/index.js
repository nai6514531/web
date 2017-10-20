import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Collapse, Button, Row, Modal } from 'antd'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import moment from 'moment'
import Dragula from 'react-dragula'
import 'dragula/dist/dragula.css'
import './drag.css'

const Panel = Collapse.Panel
const breadItems = [
  {
    title: '闲置系统'
  },
  {
    title: '频道管理',
    url: '/2/channel'
  },
  {
    title: '频道排序'
  }
]
class ChannelOrder extends Component {
  constructor(props) {
    super(props)
    this.activeKey
    this.columns = [
      { title: 'id', dataIndex: 'id', key: 'id' },
      { title: '排序', dataIndex: 'order', key: 'order' },
      { title: '频道名称', dataIndex: 'title',key: 'title' },
      { title: '已上架商品数', dataIndex: 'description',key: 'description' },
      { title: '处于交易中的商品数', dataIndex: 'a', key: 'a' },
      { title: '待确认上架商品数', dataIndex: 'b',key: 'b' },
      { title: '频道状态', dataIndex: 'status',key: 'status' }
    ]
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'channel/list',
      payload: {
        data: null
      }
    })

  }
  getBodyWrapper = (body) => {
    return (
      <tbody className='container ant-table-tbody' ref={this.dragulaDecorator}>
        {body.props.children}
      </tbody>
    )
  }
  dragulaDecorator = (componentBackingInstance) => {
    if (componentBackingInstance) {
      let drake = Dragula([componentBackingInstance])
      drake.on("drag", (el, target, source, sibling) => {
        el.className = ' ex-drag'
      })
      drake.on("drop", (el, target, source, sibling) => {
        el.className = el.className.replace('ex-drag', 'ex-moved')
        this._onDrop(el, target, source, sibling)
        drake.cancel(true)
      })

      drake.on("over", (el, container) => {
        container.className += ' ex-over';
      })

      drake.on("cancel", (el, target) => {
         this._onCancel(el, target)
         el.className = el.className.replace('ex-drag', 'ex-moved')
      })
    }
  }
  _onDrop = (el, target, source, sibling) => {
    let sorting = []
    let orders = this.props.channel.data.objects
    for(let i = 0; i < target.children.length; i++) {
      let child = target.children[i]
      let id = parseInt(child.children[0].innerText)
      sorting.push(id)
    }
    let i = 1
    sorting.forEach(id => {
      let order = orders.find(function(o) { return o.id == id })
      order.sequence = i++
    })

    let ordersSorted = orders.sort((o1, o2) => o1.sequence - o2.sequence)

    this.ordersCopy = ordersSorted
  }
  _onCancel = (el, target) => {
    this.ordersCopy = this.ordersCopy || this.props.channel.data.objects
    this.props.dispatch({
      type: 'channel/updateData',
      payload: {
        data : {
          objects: this.ordersCopy
        }
      }
    })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
  }
  order = () => {
    const objects = this.props.channel.data.objects
    let data = []
    objects.map((value, index) => {
      data.push({
        id: value.id,
        order: index + 1
      })
    })
    this.props.dispatch({
      type: 'channel/order',
      payload: {
        data
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'channel/hideModal',
    })
  }
  render() {
    const { channel: { data: { objects }, visible, key, previewImage }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Button
          type='primary'
          style={{ marginBottom: 10 }}
          onClick={this.order}
          >
          同步到现网
        </Button>
        <DataTable
          dataSource={objects}
          columns={this.columns}
          loading={loading}
          pagination={false}
          scroll={{ x: 700 }}
          getBodyWrapper={this.getBodyWrapper}
        />
        <Modal key={key} visible={visible} footer={null} onCancel={this.hide}>
          <img alt='图片加载失败' style={{ padding: 15, width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'channel/clear'})
    this.props.dispatch({ type: 'common/resetSearch'})
  }
}
function mapStateToProps(state,props) {
  return {
    channel: state.channel,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(ChannelOrder)
