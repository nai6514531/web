import React, { Component } from 'react'
import { Icon, message } from 'antd'
import _ from 'underscore'
import Promise from 'bluebird'
import cx from 'classnames'

import platform from '../../utils/platform'
import { isDebug } from '../../utils/debug'

import WechatService from '../../services/wechat'

import styles from './index.pcss'

export class Scan extends Component {
  constructor(props) {
    super(props)
    this.loading = false
    this.proxy = null
  }
  componentWillUnmount() {
    if (this.proxy) {
      this.proxy.removeAllListeners()
    }
  }
  handleScanResult (content) {
    this.loading = false
    if (!content || typeof content !== 'string') {
      return
    }
    return this.props.handleScanResult && this.props.handleScanResult(content)
  }
  scanByProxy (proxy) {
    if (this.proxy) {
      this.proxy.removeAllListeners()
    }
    this.proxy = proxy
    this.proxy.once('resolve', (content) => this.handleScanResult(content))
  }

  handleClickScan () {
    if (this.loading) {
      return
    }

    if (platform.app.isWechat() || isDebug) {
      this.loading = true
      return WechatService.getQRCodeProxy()
        .then((proxy) => this.scanByProxy(proxy))
        .catch((err) => {
          console.error(err)
          this.loading = false
          message.error(err.message)
        })
    }
    message.info("扫码功能暂只支持在微信内使用哦！")
  }

  render() {
    let { className } = this.props
    
    return platform.app.isWechat() || isDebug ? 
      <span onClick={this.handleClickScan.bind(this)} className={cx(styles.scan, className)}>
        <Icon type="scan" />
      </span> : null
  }
}
