import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import DataTable from '../../../components/data-table/'
import Breadcrumb from '../../../components/layout/breadcrumb/'
const dataSource = [{
  id: '1',
  name: '胡彦斌',
  contact: 'xx',
  address: '西湖区湖底公园1号',
  account: '133xxxxxxxx'
}]

const columns = [
  {
    title: '用户编号',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '运营商名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '联系人',
    dataIndex: 'contact',
    key: 'contact',
  },
  {
    title: '登录账号',
    dataIndex: 'account',
    key: 'account',
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: '操作',
    render: () => <a href="#">修改</a>,
  }
]

const breadItems = [
  {
    title: 'xxx',
    url: 'xxx'
  },
  {
    title: 'xxx',
    url: 'xxx'
  }
]
class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      loading: false
    }
  }
  componentDidMount() {
    this.fetch()
  }
  fetch = (current) => {
    this.setState({
      loading: true
    })
    setTimeout(() => {
      this.setState({
        loading: false,
        dataSource: dataSource
      })
    },3000)
  }
  render() {
    const { dataSource, loading } = this.state
    return(
      <div>
        <Breadcrumb items={breadItems} />
        <DataTable
          dataSource={dataSource}
          columns={columns}
          loading={loading}
        />
      </div>
    )
  }
}
export default User
