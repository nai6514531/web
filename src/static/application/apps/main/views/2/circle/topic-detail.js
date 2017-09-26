import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { Row, Col, Spin, Card, Modal } from 'antd'
import styles from './index.pcss'
import moment from 'moment'
import { status } from './dict.js'

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
  handlePreview = (img) => {
    this.props.dispatch({
      type: 'topicDetail/showModal',
      payload: {
        previewImage: img
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'topicDetail/hideModal'
    })
  }
  render() {
    const { topicDetail: { data, visible, previewImage }, loading  } = this.props
    const breadItems = [
      {
        title: '闲置系统'
      },
      {
        title: '城市管理',
        url: `/2/circle`
      },
      {
        title: '商品管理',
        url: `/2/topic/#cityId=${data.cityId}`
      },
      {
        title: '商品详情'
      }
    ]
    return(
      <Spin
        tip='加载中...'
        spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Card>
          <p className={styles.wrapper}><span className={styles.title}>商品标题:</span><span className={styles.description}>{data.title}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>商品价格:</span><span className={styles.description}>{`${data.value / 100}.00`}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>发帖时间:</span><span className={styles.description}>{moment(data.createdAt).format('YYYY-MM-DD HH:mm')}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>所属频道:</span><span className={styles.description}>{data.channelTitle}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>交易状态:</span><span className={styles.description}>{status[data.status]}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>浏览量:</span><span className={styles.description}>{data.uniqueVisitor}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>点赞数:</span><span className={styles.description}>{data.likes}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>评论数:</span><span className={styles.description}>{data.comments}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>商品描述:</span><span className={styles.description}>{data.content}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>共有多少人来询问:</span><span className={styles.description}>{data.consultation}</span></p>
          <div className={styles['img-wrapper']}>
            {
              data.images && JSON.parse(data.images).map( (value,index) => {
                return <div className={styles['img-item']} key={index} onClick={this.handlePreview.bind(this,value.url)}><img src={value.url}/></div>
              })
            }
          </div>
          <Modal visible={visible} footer={null} onCancel={this.hide}>
            <img alt='图片加载失败' style={{ padding: 15, width: '100%' }} src={previewImage} />
          </Modal>
        </Card>
      </Spin>
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
