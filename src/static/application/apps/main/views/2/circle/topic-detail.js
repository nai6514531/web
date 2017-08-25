import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import {Row, Col} from 'antd'
import styles from './index.pcss'
import moment from 'moment'

const breadItems = [
  {
    title: '闲置系统'
  },
  {
    title: '圈子管理',
    url: '/2/circle'
  },
  {
    title: '商品管理',
    url: '/2/topic'
    // 需要加城市id
  },
  {
    title: '商品详情'
  }
]
class TopicDetail extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const id = this.props.match.params.id
    this.props.dispatch({
      type: 'topicDetail/list',
      payload: {
        id: id
      }
    })
  }
  render() {
    const { topicDetail: { data }, loading  } = this.props
    console.log(data)
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <p className={styles.text}><span className={styles.title}>帖子标题:</span>{data.title}</p>
        <p className={styles.text}><span className={styles.title}>帖子描述:</span>{data.description}</p>
        <p className={styles.text}><span className={styles.title}>帖子价格:</span>{data.value / 100}</p>
        <p className={styles.text}><span className={styles.title}>发帖时间:</span>{moment(data.createdAt).format('YYYY-MM-DD HH:mm')}</p>
        <p className={styles.text}><span className={styles.title}>帖子所属频道:</span>{data.channelTitle}</p>
        {
          data.images && JSON.parse(data.images).map( (value,index) => {
            return <div className={styles['img-wrap']} key={index}><img src={value.url}/></div>
          })
        }
        <p className={styles.text}><span className={styles.title}>浏览量:</span>{data.uniqueVisitor}</p>
        <p className={styles.text}><span className={styles.title}>评论数:</span>{data.comments}</p>
        <p className={styles.text}><span className={styles.title}>成交状态:</span>{data.status}</p>
      </div>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'topicDetail/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    topicDetail: state.topicDetail,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(TopicDetail)

