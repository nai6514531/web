import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'
import Platform from 'bundle-loader?lazy!../../views/platform/index.js'
import PlatformEdit from 'bundle-loader?lazy!../../views/platform/edit.js'
import platformModel from 'bundle-loader?lazy!../../models/platform/index.js'

import City from 'bundle-loader?lazy!../../views/platform/address/city.js'
import CityModel from 'bundle-loader?lazy!../../models/platform/address/city.js'
import Province from 'bundle-loader?lazy!../../views/platform/address/province.js'
import ProvinceModel from 'bundle-loader?lazy!../../models/platform/address/province.js'
import Area from 'bundle-loader?lazy!../../views/platform/address/area.js'
import AreaModel from 'bundle-loader?lazy!../../models/platform/address/area.js'
import Street from 'bundle-loader?lazy!../../views/platform/address/street.js'
import StreetModel from 'bundle-loader?lazy!../../models/platform/address/street.js'
import School from 'bundle-loader?lazy!../../views/platform/address/school.js'
import SchoolModel from 'bundle-loader?lazy!../../models/platform/address/school.js'
export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/platform/business' component={getComponent(Platform,app,platformModel)} />
      <Route exact path='/platform/business/:id' component={getComponent(PlatformEdit,app,platformModel)} />
      <Route exact path='/platform/province' component={getComponent(Province,app,ProvinceModel)} />
      <Route exact path='/platform/city' component={getComponent(City,app,CityModel)} />
      <Route exact path='/platform/area' component={getComponent(Area,app,AreaModel)} />
      <Route exact path='/platform/street' component={getComponent(Street,app,StreetModel)} />
      <Route exact path='/platform/school' component={getComponent(School,app,SchoolModel)} />
    </Switch>
  )
}
