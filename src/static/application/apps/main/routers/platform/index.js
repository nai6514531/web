import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import Platform from 'bundle-loader?lazy!../../views/platform/index.js'
import PlatformEdit from 'bundle-loader?lazy!../../views/platform/edit.js'
import platformModal from 'bundle-loader?lazy!../../models/platform/index.js'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/platform/business' component={getComponent(Platform,app,platformModal)} />
      <Route exact path='/platform/business/:id' component={getComponent(PlatformEdit,app,platformModal)} />
    </Switch>
  )
}
