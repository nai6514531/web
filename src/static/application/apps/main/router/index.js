import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Switch, Redirect, Route } from 'react-router-dom'
import { getComponent } from '../components/bundle/'
import Login from 'bundle-loader?lazy!../view/login'
import LoginModel from 'bundle-loader?lazy!../models/login/index.js'
import Layout from '../components/layout/'
import NotFound from 'bundle-loader?lazy!../view/not-found'
import { Table } from 'antd';
const columns = [
  { title: 'Full Name', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
  { title: 'Age', width: 100, dataIndex: 'age', key: 'age', fixed: 'left' },
  { title: 'Column 1', dataIndex: 'address', key: '1', width: 150 },
  { title: 'Column 2', dataIndex: 'address', key: '2', width: 150 },
  { title: 'Column 3', dataIndex: 'address', key: '3', width: 150 },
  { title: 'Column 4', dataIndex: 'address', key: '4', width: 150 },
  { title: 'Column 5', dataIndex: 'address', key: '5', width: 150 },
  { title: 'Column 6', dataIndex: 'address', key: '6', width: 150 },
  { title: 'Column 7', dataIndex: 'address', key: '7', width: 150 },
  { title: 'Column 8', dataIndex: 'address', key: '8' },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 100,
    render: () => <a href="#">action</a>,
  },
];

const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}
const columns2 = [{
  title: 'Name',
  dataIndex: 'name',
  width: 1600,
}, {
  title: 'Age',
  dataIndex: 'age',
  width: 1600,
}, {
  title: 'Address',
  dataIndex: 'address',
  width: 3600,
}];

const data2 = [];
for (let i = 0; i < 100; i++) {
  data2.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  });
}



function RouterConfig({ history, app }) {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/login"/>}/>
        <Route exact path="/login" component={getComponent(Login,app,LoginModel)}/>
        <Route path="/admin" render={ props => (
          <Layout>
            <div style={{background: 'red'}}>132</div>
            <Table columns={columns} dataSource={data} scroll={{ x: 1500, y: 300 }} />
            <Table columns={columns2} dataSource={data2} scroll={{ x: 1500,y: 300 }} />
            <Table columns={columns} dataSource={data} scroll={{ x: 1500, y: 300 }} />
          </Layout>
        )}/>
        <Route component={getComponent(NotFound,app,LoginModel)} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
