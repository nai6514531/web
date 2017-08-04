import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import User from 'bundle-loader?lazy!../../views/settings/user'
import UserEdit from 'bundle-loader?lazy!../../views/settings/user/edit'
import userModel from 'bundle-loader?lazy!../../models/settings/user.js'
import Role from 'bundle-loader?lazy!../../views/settings/role'
import roleModel from 'bundle-loader?lazy!../../models/settings/role.js'
import Menu from 'bundle-loader?lazy!../../views/settings/menu'
import menuModel from 'bundle-loader?lazy!../../models/settings/menu.js'
import Password from 'bundle-loader?lazy!../../views/settings/password'
import Permission from 'bundle-loader?lazy!../../views/settings/permission'
import permissionModel from 'bundle-loader?lazy!../../models/settings/permission.js'
import Action from 'bundle-loader?lazy!../../views/settings/action'
import actionModel from 'bundle-loader?lazy!../../models/settings/action.js'
import Element from 'bundle-loader?lazy!../../views/settings/element'
import elementModel from 'bundle-loader?lazy!../../models/settings/element.js'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/admin/settings/user' component={getComponent(User,app,userModel)} />
      <Route path='/admin/settings/user/:id' component={getComponent(UserEdit,app,userModel)} />
      <Route path='/admin/settings/role' component={getComponent(Role,app,roleModel)} />
      <Route path='/admin/settings/menu' component={getComponent(Menu,app,menuModel)} />
      <Route path='/admin/settings/permission' component={getComponent(Permission,app,permissionModel)} />
      <Route path='/admin/settings/change-password' component={getComponent(Password,app,userModel)} />
      <Route path='/admin/settings/action' component={getComponent(Action,app,actionModel)} />
      <Route path='/admin/settings/element' component={getComponent(Element,app,elementModel)} />
    </Switch>
  )
}
