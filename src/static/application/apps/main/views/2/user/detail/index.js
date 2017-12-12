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
    title: '用户管理',
    url: `/2/users`
  },
  {
    title: '用户详情'
  }
]

class UserDetail extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const id = this.props.match.params.id
    this.props.dispatch({
      type: 'twoUser/detail',
      payload: {
        id: id
      }
    })
  }
  handlePreview = (img) => {
    this.props.dispatch({
      type: 'twoUser/showImageModal',
      payload: {
        previewImage: img
      }
    })
  }
  hide = () => {
    this.props.dispatch({
      type: 'twoUser/hideModal'
    })
  }
  render() {
    const { twoUser: { detail, previewVisible, previewImage }, loading  } = this.props
    return(
      <Spin
        tip='加载中...'
        spinning={loading}>
        <Breadcrumb items={breadItems} />
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>用户基本信息:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>昵称：</span>{detail.name}</div>
              <div><span className={styles.title}>省市：</span>{detail.provinceName + detail.cityName}</div>
              <div><span className={styles.title}>学校：</span>{detail.schoolName}</div>
              <div><span className={styles.title}>注册时间：</span>{moment(detail.createdAt).format('YYYY-MM-DD HH:mm')}</div>
              <div>
                <span className={styles.title}>头像：</span>
                <span className={styles['img-item']} onClick={this.handlePreview.bind(this,detail.avatorUrl)}><img src={detail.avatorUrl}/></span>
              </div>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>用户行为信息:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>点赞数：</span>{detail.onSaleCount}</div>
              <div><span className={styles.title}>留言数：</span>{detail.checkingCount}</div>
            </div>
          </div>
        </Card>
        <Modal visible={previewVisible} footer={null} onCancel={this.hide}>
          <img alt='图片加载失败' style={{ padding: 15, width: '100%' }} src={previewImage} />
        </Modal>
      </Spin>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'twoUser/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    twoUser: state.twoUser,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(UserDetail)
