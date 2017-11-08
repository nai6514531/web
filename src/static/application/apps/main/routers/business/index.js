import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'

import BusinessStatistics from 'bundle-loader?lazy!../../views/business/statistics/'
import BusinessStatisticsModel from 'bundle-loader?lazy!../../models/business/statistics/'

import ConsumeSearchByDay from 'bundle-loader?lazy!../../views/business/statistics/consume/day.js'
import ConsumeSearchDayDetail from 'bundle-loader?lazy!../../views/business/statistics/consume/day-detail.js'
import ConsumeSearchDayDevice from 'bundle-loader?lazy!../../views/business/statistics/consume/device-detail.js'
import DeviceSearchByDay from 'bundle-loader?lazy!../../views/business/statistics/device/day.js'

import ConsumeSearch from 'bundle-loader?lazy!../../views/business/consume/'
import ConsumeSearchModel from 'bundle-loader?lazy!../../models/business/consume/'

export default function (history, app) {
  return (
    <Switch>
      <Route exact path='/business/statistics' component={getComponent(BusinessStatistics,app,BusinessStatisticsModel)} />
      <Route exact path='/business/statistics/consume/:month' component={getComponent(ConsumeSearchByDay,app,BusinessStatisticsModel)} />
      <Route exact path='/business/statistics/consume/:month/:day' component={getComponent(ConsumeSearchDayDetail,app,BusinessStatisticsModel)} />
      <Route exact path='/business/statistics/consume/:month/:day/:deviceSerial' component={getComponent(ConsumeSearchDayDevice,app,BusinessStatisticsModel)} />
      <Route exact path='/business/statistics/device/:month/:deviceSerial' component={getComponent(DeviceSearchByDay,app,BusinessStatisticsModel)} />
      <Route exact path='/business/consume-search' component={getComponent(ConsumeSearch,app,ConsumeSearchModel)} />
    </Switch>
  )
}
