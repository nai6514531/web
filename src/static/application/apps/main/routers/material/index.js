import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'

import Image from 'bundle-loader?lazy!../../views/material/image/'
import imageModel from 'bundle-loader?lazy!../../models/material/image/index.js'


export default function (app) {
  return (
    <Switch>
      <Route exact path='/material/image' component={getComponent(Image,app,imageModel)} />
    </Switch>
  )
}
