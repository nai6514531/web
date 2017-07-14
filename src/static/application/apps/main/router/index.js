import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Switch, Redirect, Route } from 'react-router-dom'
import { getComponent } from '../components/bundle/'
import Login from 'bundle-loader?lazy!../view/login'
import LoginModel from 'bundle-loader?lazy!../models/login/index.js'
import Layout from '../components/layout/'
import NotFound from 'bundle-loader?lazy!../view/not-found'
function RouterConfig({ history, app }) {
  return (
    <Router>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/login"/>}/>
        <Route exact path="/login" component={getComponent(Login,app,LoginModel)}/>
        <Route path="/admin" render={ props => (
          <Layout>
              <h1>321231332123133211xxxxxxx32123133212313321xxxxxxx</h1>
              <h1>3</h1>
              <h1>3</h1>
              <h1>3</h1>
              <h1>3</h1>
              <h1>3</h1>
              <h1>3</h1>
              <h1>3</h1>
              <h1>3</h1><h1>3</h1>
              <h1>3</h1>
              <h1>3</h1>
              <h1>3</h1>
              <h1>3</h1>
              <h1>2</h1>
          </Layout>
        )}/>
        <Route component={getComponent(NotFound,app,LoginModel)} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
