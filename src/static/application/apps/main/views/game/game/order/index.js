import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import { Button, Modal, Select, Row, Col, DatePicker, Input, message, Card } from 'antd'
import DataTable from '../../../../components/data-table/'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { transformUrl, toQueryString } from '../../../../utils/'
import history from '../../../../utils/history.js'
import moment from 'moment'
import supplierService from '../../../../services/game/supplier'
import gameService from '../../../../services/game/game'

import Dragula from 'react-dragula'
import 'dragula/dist/dragula.css'
import './drag.css'
import styles from '../index.pcss'


const Option = Select.Option
const confirm = Modal.confirm
const RangePicker = DatePicker.RangePicker
const Grid = Card.Grid
const breadItems = [
  {
    title: '游戏管理'
  },
  {
    title: '游戏排序'
  }
]

const listStyle = {
  height: 107,
  textAlign: "center",
  width: 50,
  lineHeight: '107px',
}
const dateFormat = 'YYYY-MM-DD HH:mm:ss'
class GameOrder extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'game/allGames',
      payload: {
        data : {
          orderBy: "game_order",
          asc: 1,
        }
      }
    })
    this.sorting = []
  }
  dragulaDecorator = (componentBackingInstance) => {
      let options = { 
        direction: 'horizontal'
      };    
    if (componentBackingInstance) {
      let drake = Dragula([componentBackingInstance], options)
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
      let id = parseInt(child.id)
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
          gameOrder: index+1,
        }
        return _item;
      })
      const self = this
      gameService.order(data).then(function(result){
          if(result.status == 'OK') {
            message.success('排序成功')
            self.sorting = []
          } else {
            result.message && message.error(result.message)
          }
        })
    } else {
      message.success('请先重新排列')      
    }
   
  }
  render() {
    const {  game: { allGames }, loading } = this.props
    return(
      <div >
        <Breadcrumb items={breadItems} />
        <Row>
        <span className={styles['button-wrap']}>
          <Button type="primary" onClick={this.handleSort.bind(this)}  style={{marginBottom: '20px', marginRight: 20}}>同步排序到现网</Button>          
        </span>
        </Row>
        <div className={styles['wrapper']}>
            <ul >
            {
              allGames.map((value, index) => {
                const item = index%10 == 0
                if (item) {
                  return (
                    <li key={value.id} style={listStyle}>
                      {index+1} ~ {index+10}
                    </li>   
                  )
                }
              })
            }
            </ul>
            <ul ref={this.dragulaDecorator} className="container" className={styles['card']}>
              {
                allGames.map((value, index) => {
                  return (
                    <li id={value.id + ''} key={value.id} >
                        <div style={{width: '50%', height: '50%', margin: '0 auto'}}>
                          <img src={value.icon} style={{width: '100%'}}/>
                        </div>
                        <p>{value.title}</p>
                    </li>     
                  )
                })
              }
              </ul>
          </div>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'game/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    game: state.game,
    loading: state.loading.global,
    common: state.common,
    ...props
  }
}
export default connect(mapStateToProps)(GameOrder)
