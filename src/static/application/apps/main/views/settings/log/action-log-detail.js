import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import Breadcrumb from '../../../components/layout/breadcrumb/'
import { Row, Col, Spin, Card, Modal } from 'antd'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
import styles from './detail.pcss'
import moment from 'moment'
import { transformUrl, toQueryString } from '../../../utils/'

const breadItems = [
  {
    title: '设置'
  },
  {
    title: '操作记录',
    url: `/admin/settings/action-logs`
  },
  {
    title: '操作记录详情'
  }
]

class ActionLogDetail extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    const id = this.props.match.params.id
    this.props.dispatch({
      type: 'log/actionDetail',
      payload: {
        id: id
      }
    })
  }
  render() {
    const { log: { detail }, loading  } = this.props
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
              <div><span className={styles.title}>用户id：</span>{detail.userId}</div>
              <div><span className={styles.title}>用户名：</span>{detail.userName}</div>
              <div><span className={styles.title}>账号：</span>{detail.userAccount}</div>
            </div>
          </div>
        </Card>
        <Card className={styles.card}>
          <div className={styles.header}>
              <h1>用户操作信息:</h1>
          </div>
          <div className={styles['sub-card']}>
            <div className={styles['card-item']}>
              <div><span className={styles.title}>接口key：</span>{detail.apiKey}</div>
              <div><span className={styles.title}>接口名：</span>{detail.apiName}</div>
              <div><span className={styles.title}>请求方法：</span>{detail.method}</div>
              <div><span className={styles.title}>响应状态：</span>{detail.responseStatus}</div>
              <div><span className={styles.title}>响应码：</span>{detail.responseCode}</div>
              <div><span className={styles.title}>响应描述：</span>{detail.responseDescription}</div>
              <div><span className={styles.title}>创建时间：</span>{moment(detail.createdAt).format('YYYY-MM-DD HH:mm')}</div>
              <div>
                <span className={styles.title}>请求参数：</span>
                <SyntaxHighlighter
                  language='json'
                  style={docco}
                  className={styles.code}>
                  {detail.requestBody || '无'}
                </SyntaxHighlighter>
            </div>
            </div>
          </div>
        </Card>
      </Spin>
    )
  }
  componentWillUnmount() {
    this.props.dispatch({ type: 'log/clear'})
  }
}
function mapStateToProps(state,props) {
  return {
    log: state.log,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(ActionLogDetail)
