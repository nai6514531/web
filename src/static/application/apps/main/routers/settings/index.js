import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import User from 'bundle-loader?lazy!../../views/settings/user'
import UserEdit from 'bundle-loader?lazy!../../views/settings/user/edit'
import userModel from 'bundle-loader?lazy!../../models/settings/user.js'
import Role from 'bundle-loader?lazy!../../views/settings/role'
import Menu from 'bundle-loader?lazy!../../views/settings/menu'
import menuModel from 'bundle-loader?lazy!../../models/settings/menu.js'
import Password from 'bundle-loader?lazy!../../views/settings/password'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/admin/settings/user' component={getComponent(User,app,userModel)} />
      <Route path='/admin/settings/user/:id' component={getComponent(UserEdit,app,userModel)} />
      <Route path='/admin/settings/role' component={getComponent(Role)} />
      <Route path='/admin/settings/menu' component={getComponent(Menu,app,menuModel)} />
      <Route path='/admin/settings/reset-password' component={getComponent(Password,app,userModel)} />
    </Switch>
  )
}
