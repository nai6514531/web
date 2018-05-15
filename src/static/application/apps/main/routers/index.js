import React from 'react'
import { Switch, Redirect, Route, Router } from 'react-router-dom'
import { LocaleProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import { getComponent } from '../components/bundle/'
import Layout from '../components/layout/'

import settings from './settings/'
// import finance from './finance/'
import idle from './2/'
import advertisement from './advertisement/'
import platform from './platform/'
import game from './game/'
import soda from './soda/'

import Login from 'bundle-loader?lazy!../views/account/login'
import ResetPassword from 'bundle-loader?lazy!../views/account/reset-password'
import LoginModel from 'bundle-loader?lazy!../models/account/login/'
import ResetPasswordModel from 'bundle-loader?lazy!../models/account/reset-password'
import NotFound from 'bundle-loader?lazy!../views/not-found'

function RouterConfig({ history, app }) {
  return (
    <LocaleProvider locale={zhCN}>
      <Router history={history}>
        <Switch>
          <Route exact path='/' component={getComponent(Login,app,LoginModel)}/>
          <Route exact path='/reset-password' component={getComponent(ResetPassword,app,ResetPasswordModel)}/>
          <Layout>
              { settings(app) }
              { idle(app) }
              { advertisement(app) }
              { platform(app) }
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
