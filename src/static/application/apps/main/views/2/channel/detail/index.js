import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { Row, Col, Spin, Card, Modal } from 'antd'
import styles from '../../../../assets/css/page-detail.pcss'
import moment from 'moment'
import { transformUrl, toQueryString } from '../../../../utils/'
import dict from '../../dict.js'

const breadItems = [
  {
    title: '闲置系统'
  },
  {
    title: '频道管理',
    url: `/2/channel`
  },
  {
    title: '频道详情'
  }
]

class ChannelDetail extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
  }
  componentDidMount() {
    const id = this.props.match.params.id
    this.props.dispatch({
      type: 'channel/detail',
      payload: {
        id: id
      }
    })
  }
  handlePreview = (img) => {
    this.props.dispatch({
      type: 'channel/showModal',
      payload: {
        previewImage: img
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'channel/hideModal'
    })
  }
  render() {
    const { channel: { detail, visible, previewImage }, loading  } = this.props
    return(
      <Spin
        tip='加载中...'
        spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>频道帖子情况:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>总帖数：</span>{isFinite(detail.totalTopics) ? detail.totalTopics : '-'}</div>
              <div><span className={styles.title}>在线帖数：</span>{isFinite(detail.onlineTopics) ? detail.onlineTopics : '-'}</div>
              <div><span className={styles.title}>C端下架数：</span>{isFinite(detail.recallTopics) ? detail.recallTopics : '-'}</div>
              <div><span className={styles.title}>总点赞数：</span>{isFinite(detail.likes) ? detail.likes : '-'}</div>
              <div><span className={styles.title}>总留言数：</span>{isFinite(detail.comments) ? detail.comments : '-'}</div>
              <div><span className={styles.title}>总私聊数：</span>{isFinite(detail.consultation) ? detail.consultation : '-'}</div>
              <div><span className={styles.title}>总打分数：</span>{isFinite(detail.grades) ? detail.grades : '-'}</div>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>频道基本信息:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>所属业务：</span>{dict.app[detail.type] || '-'}</div>
              <div><span className={styles.title}>标题：</span>{detail.title || '-'}</div>
              <div><span className={styles.title}>副标题：</span>{detail.subtitle || '-'}</div>
              <div><span className={styles.title}>描述：</span>{detail.description || '-'}</div>
              <div><span className={styles.title}>创建时间：</span>{moment(detail.createdAt).format('YYYY-MM-DD HH:mm')}</div>
              <div><span className={styles.title}>状态：</span>{detail.status === 0 ? '正常' : '已下架'}</div>
              <div><span className={styles.title}>背景图：</span></div>
              <p>
                <span className={styles['img-item']} onClick={this.handlePreview.bind(this,detail.imageUrl)}><img src={detail.imageUrl}/></span>
              </p>
            </div>
          </div>
        </Card>
        <Modal visible={visible} footer={null} onCancel={this.hide}>
          <img alt='图片加载失败' style={{ padding: 15, width: '100%' }} src={previewImage} />
        </Modal>
      </Spin>
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
export default connect(mapStateToProps)(ChannelDetail)
