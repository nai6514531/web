import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
import { Row, Col, Spin, Card, Modal } from 'antd'
import styles from './detail.pcss'
import moment from 'moment'
import { transformUrl, toQueryString } from '../../../../utils/'

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
      type: 'channelDetail/list',
      payload: {
        id: id
      }
    })
  }
  handlePreview = (img) => {
    this.props.dispatch({
      type: 'channelDetail/showModal',
      payload: {
        previewImage: img
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'channelDetail/hideModal'
    })
  }
  render() {
    const { channelDetail: { data, visible, previewImage }, loading  } = this.props
    return(
      <Spin
        tip='加载中...'
        spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>频道商品情况:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>在售商品数：</span>{data.uniqueVisitor}</div>
              <div><span className={styles.title}>待确认商品数：</span>{data.likes}</div>
              <div><span className={styles.title}>处于交易中商品数：</span>{data.comments}</div>
              <div><span className={styles.title}>交易成功商品数：</span>{data.consultation}</div>
              <div><span className={styles.title}>询问人数：</span>{data.consultation}</div>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>频道基本信息:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>标题：</span>{data.title}</div>
              <div><span className={styles.title}>副标题：</span>{data.content}</div>
              <div><span className={styles.title}>创建时间：</span>{(data.value / 100).toFixed(2)}</div>
              <div><span className={styles.title}>当前所处位置：</span>{data.channelTitle}</div>
              <div><span className={styles.title}>状态：</span>{moment(data.createdAt).format('YYYY-MM-DD HH:mm')}</div>
              <div><span className={styles.title}>背景图：</span></div>
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
        <Modal visible={visible} footer={null} onCancel={this.hide}>
          <img alt='图片加载失败' style={{ padding: 15, width: '100%' }} src={previewImage} />
        </Modal>
      </Spin>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'channelDetail/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    channelDetail: state.channelDetail,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(ChannelDetail)
