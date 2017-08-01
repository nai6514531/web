import React from 'react'
import { Switch, Redirect, Route, BrowserRouter as Router } from 'react-router-dom'
import { getComponent } from '../components/bundle/'
import settings from './settings/'
import Login from 'bundle-loader?lazy!../views/login'
import loginModel from 'bundle-loader?lazy!../models/login/'
import Layout from '../components/layout/'
import NotFound from 'bundle-loader?lazy!../views/not-found'
function RouterConfig({ history, app }) {
  return (
    <Router>
      <Switch>
        <Route exact path='/' render={() => <Redirect to='/login'/>}/>
        <Route exact path='/login' component={getComponent(Login,app,loginModel)}/>
        <Route path='/admin' render={ props => (
          <Layout>
            { settings(history, app) }
          </Layout>
        )}/>
        <Route component={getComponent(NotFound)} />
      </Switch>
    </Router>
  )
}

export default RouterConfig;
