import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import User from 'bundle-loader?lazy!../../views/permission/user'
import Role from 'bundle-loader?lazy!../../views/permission/role'

export default function (history, app) {
  return (
    <Switch>
      <Route path='/admin/permission/user' component={getComponent(User)} />
      <Route path='/admin/permission/role' component={getComponent(Role)} />
    </Switch>
  )
}
