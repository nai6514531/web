import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { Row, Col, Spin, Card, Modal } from 'antd'
import moment from 'moment'
import dict from '../../../../utils/dict.js'
import styles from '../../../../assets/css/page-detail.pcss'
import { transformUrl, toQueryString } from '../../../../utils/'
import emoji from 'node-emoji'

class TopicDetail extends Component {
  constructor(props) {
    super(props)
    const search = transformUrl(location.search)
    this.search = search
    let { from, cityId, channelId } = this.search
    if(from == 'city') {
      this.breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '城市管理',
          url: `/2/city`
        },
        {
          title: '帖子管理',
          url: `/2/topic/?cityId=${cityId}&from=${from}`
        },
        {
          title: '帖子详情'
        }
      ]
    } else if(from == 'channel') {
      this.breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '频道管理',
          url: `/2/channel`
        },
        {
          title: '帖子管理',
          url: `/2/topic?channelId=${channelId}&from=${from}`
        },
        {
          title: '帖子详情'
        }
      ]
    } else {
      this.breadItems = [
        {
          title: '闲置系统'
        },
        {
          title: '帖子管理',
          url: `/2/topic`
        },
        {
          title: '帖子详情'
        }
      ]
    }
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
    return(
      <Spin
        tip='加载中...'
        spinning={loading}>
        <Breadcrumb items={this.breadItems} />
        {/*
        <Card>
          <p className={styles.wrapper}><span className={styles.title}>帖子标题:</span><span className={styles.description}>{data.title}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>帖子价格:</span><span className={styles.description}>{(data.value / 100).toFixed(2)}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>发帖时间:</span><span className={styles.description}>{moment(data.createdAt).format('YYYY-MM-DD HH:mm')}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>所属频道:</span><span className={styles.description}>{data.channelTitle}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>交易状态:</span><span className={styles.description}>{status[data.status]}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>浏览量:</span><span className={styles.description}>{data.uniqueVisitor}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>点赞数:</span><span className={styles.description}>{data.likes}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>留言数:</span><span className={styles.description}>{data.comments}</span></p>
          <p className={styles.wrapper}><span className={styles.title}>帖子描述:</span><span className={styles.description}>{data.content}</span></p>
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

        */}
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>帖子交易情况:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              { /*<div><span className={styles.title}>浏览量：</span>{data.uniqueVisitor}</div>*/ }
              <div><span className={styles.title}>点赞数：</span>{data.likes}</div>
              <div><span className={styles.title}>留言数：</span>{data.comments}</div>
              <div><span className={styles.title}>询问人数：</span>{data.consultation}</div>
              <div><span className={styles.title}>交易状态：</span>{dict.topicStatus[data.status]}</div>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>帖子基本信息:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>标题：</span>{data.title || '-' }</div>
              <div><span className={styles.title}>描述：</span>{data.content && emoji.emojify(data.content) || '-' }</div>
              <div><span className={styles.title}>价格：</span>{(data.value / 100).toFixed(2)}</div>
              <div><span className={styles.title}>所在城市：</span>{data.cityName || '-' }</div>
              <div><span className={styles.title}>所在学校：</span>{data.schoolName || '-' }</div>
              <div><span className={styles.title}>所属频道：</span>{data.channelTitle || '-' }</div>
              <div><span className={styles.title}>发布时间：</span>{moment(data.createdAt).format('YYYY-MM-DD HH:mm')}</div>
              <div><span className={styles.title}>图片：</span></div>
              <p>
                {
                  data.images && JSON.parse(data.images).map( (value,index) => {
                    return <span className={styles['img-item']} key={index} onClick={this.handlePreview.bind(this,value.url)}><img src={value.url}/></span>
                  })
                }
              </p>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>帖子发布人信息：</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>昵称：</span>{data.user.name || '-'}</div>
              <div><span className={styles.title}>手机号：</span>{data.user.mobile || '-'}</div>
              <div><span className={styles.title}>所在城市：</span>{data.user.cityName || '-'}</div>
              <div><span className={styles.title}>所在学校：</span>{data.user.schoolName || '-'}</div>
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
