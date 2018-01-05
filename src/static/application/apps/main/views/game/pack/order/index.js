import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Select, Row, Input, message } from 'antd'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import history from '../../../../utils/history.js'
import styles from '../index.pcss'
import moment from 'moment'
import gameService from '../../../../services/game/game'
import packService from '../../../../services/game/pack'

import Dragula from 'react-dragula'
import 'dragula/dist/dragula.css'
import '../../../advertisement/ad-config/drag.css'

const Option = Select.Option

const breadItems = [
  {
    title: '游戏管理系统'
  },
  {
    title: '礼包管理',
    url: '/game/pack'        
  },
  {
    title: '礼包排序'
  }
]
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
class PackOrder extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    this.state = {
      games: [],
      packs: [],
    }
    this.columns = [
      { title: '礼包ID', dataIndex: 'id', key: 'id' },
      { title: '礼包名', dataIndex: 'name', key: 'name' },
      {
        title: '有效期',
        key: 'time',
        render: (text, record, index) => {
          return (
            `${moment(record.startedAt).format(dateFormat)}  ~  ${moment(record.endedAt).format(dateFormat)}`
          )
        }
      }, 
      { title: '初始库存', dataIndex: 'count', key: 'count' },      
    ]
  }
  games() {
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
  componentDidMount() {
    this.games()
    const url = this.search
    this.props.dispatch({
      type: 'common/updateSearch',
      payload: {
        search: url
      }
    })
    if (url.gameId) {
      this.fetch(url)
    }
    this.sorting = [];
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
  searchClick = (type) => {
    // this.search.offset = 0
    // this.search.limit = transformUrl(location.search).limit || 10
    this.search.orderBy = "pack_order"
    this.search.asc = 1
    this.search.status = "0"
    
    const queryString = toQueryString({ ...this.search })
    this.props.dispatch({
      type: 'common/resetIndex'
    })
    history.push(`${location.pathname}?${queryString}`)
    if (!this.search.gameId) {
      this.clearPacks()
    } else {
      this.fetch(this.search)
    }
  }
  fetch =(url) => {
    this.props.dispatch({
      type: 'pack/list',
      payload: {
        data: url
      }
    })
  }
  clearPacks() {
    this.props.dispatch({
      type: 'pack/clearList',
    })
  }
  change = (url) => {
    this.search = { ...this.search, ...url }
    this.fetch(url)
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
      })

      drake.on("over", (el, container) => {
        container.className += ' ex-over';
      })
      drake.on("cancel", (el, target) => {
         el.className = el.className.replace('ex-drag', 'ex-moved')
      })
    }
  }
  _onDrop = (el, target, source, sibling) => {
    let sorting = []
    for(let i = 0; i < target.children.length; i++) {
      let child = target.children[i]
      let id = parseInt(child.children[0].innerText)
      sorting.push(id)
    }
    this.sorting = sorting;
  }
  handleSort() {
    const sorting = this.sorting;
    if (sorting.length > 0) {
      const data = sorting.map(function(item, index){
        const _item = {
          id: item,          
          packOrder: index + 1,
        }
        return _item;
      })
      const self = this
      packService.order(data).then(function(result){
          if(result.status == 'OK') {
            message.success('排序成功')
          } else {
            result.message && message.error(result.message)
          }
        })
    } else {
      message.success('请先重新排列')      
    }
  }
 
  render() {
    const { common: { search }, pack: { data: { objects } }, loading } = this.props
    const { games } = this.state;
    const statusList = [{status: 0, title: '上架'}, {status: 1, title: '下架'}]
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <Row>
        <Select
          value={ search.gameId }
          showSearch
          allowClear
          style={{ width: 150, marginRight: 10 }}          
          placeholder="游戏名"
          optionFilterProp="children"
          onChange={this.selectHandler.bind('this','gameId')}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
         {
          games.map(value => {
            return (
              <Option value={value.id + ''} key={value.id}>{value.title}</Option>
            )
          })
        }
        </Select>
        <span className={styles['button-wrap']}>
          <Button
            type='primary'
            onClick={this.searchClick.bind(this, 'search')}
            style={{marginBottom: '20px', marginRight: 20}}
            >
            筛选
          </Button>
          <Button type="primary" onClick={this.handleSort.bind(this)}>同步排序到现网</Button>  
        </span>
        </Row>
        <DataTable
           dataSource={objects}
           columns={this.columns}
           loading={loading}
           change={this.change}
           scroll={{ x: 800 }}
           getBodyWrapper={this.getBodyWrapper.bind(this)}

        />
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'pack/clear'})
    this.props.dispatch({ type: 'common/resetSearch' })
  }
}
function mapStateToProps(state,props) {
  return {
    pack: state.pack,
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(PackOrder)
