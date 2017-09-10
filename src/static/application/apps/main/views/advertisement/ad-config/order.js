import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Collapse, Button, Row, Modal } from 'antd'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../utils/'
import moment from 'moment'
import Dragula from 'react-dragula'
import 'dragula/dist/dragula.css'
import './drag.css'

const Panel = Collapse.Panel
const breadItems = [
  {
    title: '业务配置系统'
  },
  {
    title: '广告配置',
    url: '/advertisement/config'
  },
  {
    title: '广告排序'
  }
]
class AdOrder extends Component {
  constructor(props) {
    super(props)
    this.activeKey
    this.columns = [
      { title: '序号', dataIndex: 'id', key: 'id' },
      { title: '广告名', dataIndex: 'name',key: 'name' },
      { title: '广告标题', dataIndex: 'title', key: 'title' },
      { title: '活动链接', dataIndex: 'url',key: 'url', width: 100 },
      {
        title: '展示时间',
        render: (text, record) => {
          return (
            `${moment(record.startedAt).format('YYYY-MM-DD HH:mm')}  ~  ${moment(record.endedAt).format('YYYY-MM-DD HH:mm')}`
          )
        }
      },
      { title: '展示状态',
        render: (text, record) => {
          return (
            record.displayStrategy === 1 ? '全部显示' : '按尾号显示'
          )
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => {
          return (
            <span>
              <a
                href='javascript:void(0)'
                onClick={() => {
                  this.props.dispatch({
                    type: 'adOrder/showModal',
                    payload: {
                      previewImage: record.image
                    }
                  })
                }}
                >
                {'\u00A0'}预览
              </a>
            </span>
          )
        }
      }
    ]
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'adOrder/postionList'
    })

  }
  getBodyWrapper = (attr, body) => {
    return (
      <tbody className='container ant-table-tbody' id={attr} ref={this.dragulaDecorator}>
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
    let id = source.getAttribute('id')
    let orders = this.props.adOrder[id]

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
    let id = target.getAttribute('id')
    this.ordersCopy = this.ordersCopy || this.props.adOrder[id]
    this.props.dispatch({
      type: 'adOrder/updateData',
      payload: {
        [id] : this.ordersCopy
      }
    })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
  }
  order = (attr) => {
    const objects = this.props.adOrder[attr]
    let data = []
    objects.map((value, index) => {
      data.push({
        id: value.id,
        order: index + 1
      })
    })
    this.props.dispatch({
      type: 'adOrder/order',
      payload: {
        data
      }
    })
  }
  changeHandler = (key,o) => {
    const { postionData } = this.props.adOrder
    const activeKey = key[key.length - 1]
    if(activeKey) {
      const { appId, id } = postionData[activeKey]
      const attr = `${appId}-${id}`
      if(!this.props.adOrder[attr]) {
        this.props.dispatch({
          type: 'adOrder/list',
          payload: {
            attr: attr,
            data: {
              appId: appId,
              locationId: id
            },
            order: true
          }
        })
      }
    }
  }
  hide = () => {
    this.props.dispatch({
      type: 'adOrder/hideModal',
    })
  }
  render() {
    const { adOrder: { postionData, previewImage, visible, key }, loading  } = this.props
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Collapse onChange={this.changeHandler}>
          {
            postionData.map((value, index) => {
              const attr = `${value.appId}-${value.id}`
              return (
                <Panel header={`${value.appName}-${value.name}`} key={index}>
                  <Button
                    type='primary'
                    style={{ marginBottom: 10 }}
                    onClick={this.order.bind(this, attr)}
                    >
                    同步到现网
                  </Button>
                  <DataTable
                    dataSource={this.props.adOrder[attr] || []}
                    columns={this.columns}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 700 }}
                    getBodyWrapper={this.getBodyWrapper.bind(this,attr)}
                  />
                </Panel>
              )
            })
          }
        </Collapse>
        <Modal key={key} visible={visible} footer={null} onCancel={this.hide}>
          <img alt="暂无图片" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'adOrder/clear'})
    this.props.dispatch({ type: 'common/resetSearch'})
  }
}
function mapStateToProps(state,props) {
  return {
    adOrder: state.adOrder,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(AdOrder)
