import React from 'react'
import { Switch, Redirect, Route, BrowserRouter as Router } from 'react-router-dom'
import { getComponent } from '../components/bundle/'
import Layout from '../components/layout/'

import settings from './settings/'
import settlement from './settlement/'
import idle from './2/'
import advertisement from './advertisement/'
import platform from './platform/'
import crm from './crm/'

import Login from 'bundle-loader?lazy!../views/login'
import loginModel from 'bundle-loader?lazy!../models/login/'
import NotFound from 'bundle-loader?lazy!../views/not-found'

function RouterConfig({ history, app }) {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={getComponent(Login,app,loginModel)}/>
        <Route path='/admin' render={ props => (
          <Layout>
            { settings(history, app) }
          </Layout>
        )}/>
        <Route path='/finance' render={ props => (
          <Layout>
            { settlement(history, app) }
          </Layout>
        )}/>
        <Route path='/2' render={ props => (
          <Layout>
            { idle(history, app) }
          </Layout>
        )}/>
        <Route path='/advertisement' render={ props => (
          <Layout>
            { advertisement(history, app) }
          </Layout>
        )}/>
        <Route path='/platform' render={ props => (
          <Layout>
            { platform(history, app) }
          </Layout>
        )}/>
        <Route path='/crm' render={ props => (
          <Layout>
            { crm(history, app) }
          </Layout>
        )}/>

        <Route component={getComponent(NotFound)} />
      </Switch>
    </Router>
  )
}

export default RouterConfig
