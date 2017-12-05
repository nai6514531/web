import React, { Component } from 'react'
import { Button, Icon } from 'antd'

import styles from './index.pcss'

class App extends Component {
	constructor (props) {
    super(props)
  }
	cancel () {
		this.props.onCancel()
	}
	submit () {
		this.props.changeModalVisible()
	}
	inputChange () {
             
  }
	render () {
		const payInfo = this.props.payInfo

		return (
			<form name='alipayment' action={payInfo.request_url + '?_input_charset=' + payInfo._input_charset} method='post' target='_blank'>
      	<div className={styles.hidden}>
					<input onChange={this.inputChange} value={payInfo.service} name='service' />
					<input onChange={this.inputChange} value={payInfo.partner} name='partner' />
					<input onChange={this.inputChange} value={payInfo._input_charset} name='_input_charset' />
					<input onChange={this.inputChange} value={payInfo.notify_url} name='notify_url' />
					<input onChange={this.inputChange} value={payInfo.account_name} name='account_name' />
					<input onChange={this.inputChange} value={payInfo.detail_data} name='detail_data' />
					<input onChange={this.inputChange} value={payInfo.batch_no} name='batch_no' />
					<input onChange={this.inputChange} value={payInfo.batch_num} name='batch_num' />
					<input onChange={this.inputChange} value={payInfo.batch_fee} name='batch_fee' />
					<input onChange={this.inputChange} value={payInfo.email} name='email' />
					<input onChange={this.inputChange} value={payInfo.pay_date} name='pay_date' />
					<input onChange={this.inputChange} value={payInfo.sign} name='sign' />
					<input onChange={this.inputChange} value={payInfo.sign_type} name='sign_type' />
        </div>
        <Icon type='info-circle' className={styles.icon} /><span>你有<i className={styles.red}>{payInfo.batch_num}</i> 笔支付宝账单需要二次确认</span>
        <Button onClick={this.submit.bind(this)} type='primary' htmlType="submit">确认支付</Button>
      </form>
		)
	}
}

export default App
