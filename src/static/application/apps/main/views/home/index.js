import React, { Component } from 'react'


class App extends Component {
	render() {
		return (<div style={{ padding: 10 }}>
			<header>欢迎进入苏打生活管理系统！</header>
      <section style={{ marginTop: 10 }}>
        <h2>重要操作指引</h2>
        <ul>
          <li>修改模块价格/修改服务名称/锁定模块/取消占用，请点击“苏打生活-设备管理”进行操作；</li>
          <li>点击“苏打生活-消费查询”，可输入模块编号或学生手机号查询对应订单；</li>
          <li>修改个人信息/管理员工账号/管理下级运营商，请点击“苏打生活-账号管理”进行操作；</li>
          <li>如需了解更多，请点击使用指南：<a href="https://shimo.im/doc/ZIEUhi3KIxIygsom" target="_blank">「苏打生活管理系统操作手册-运营商专用」</a></li>
        </ul>
      </section>
		</div>)
	}
}

export default App