import React from 'react'
import { Switch, Redirect, Route, Router } from 'react-router-dom'
import { LocaleProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import { getComponent } from '../components/bundle/'
import Layout from '../components/layout/'

import settings from './settings/'
import finance from './finance/'
import idle from './2/'
import advertisement from './advertisement/'
import platform from './platform/'
import crm from './crm/'
import business from './business/'
import game from './game/'
import soda from './soda/'

import Login from 'bundle-loader?lazy!../views/login'
import loginModel from 'bundle-loader?lazy!../models/login/'
import NotFound from 'bundle-loader?lazy!../views/not-found'

function RouterConfig({ history, app }) {
  return (
    <LocaleProvider locale={zhCN}>
      <Router history={history}>
        <Switch>
          <Route exact path='/' component={getComponent(Login,app,loginModel)}/>
          <Layout>
              { settings(app) }
              { idle(app) }
              { advertisement(app) }
              { platform(app) }
              { crm(app) }
              { game(app) }
              { soda(app) }
          </Layout>
          <Route component={getComponent(NotFound)} />
        </Switch>
      </Router>
    </LocaleProvider>
  )
}

export default RouterConfig
