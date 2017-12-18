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

import bill from 'bundle-loader?lazy!../../views/business/bill'
import billDetailList from 'bundle-loader?lazy!../../views/business/bill/detail'
import dailyBill from 'bundle-loader?lazy!../../views/business/daily-bill'
import dailyDetailBill from 'bundle-loader?lazy!../../views/business/daily-bill/detail'
import account from 'bundle-loader?lazy!../../views/business/account'
import accountEdit from 'bundle-loader?lazy!../../views/business/account/edit'

import chipcardDetail from 'bundle-loader?lazy!../../views/business/chipcard/detail'
import chipcardRechargeList from 'bundle-loader?lazy!../../views/business/chipcard'

export default function (app) {
  return (
    <Switch>
      <Route exact path='/business/statistics' component={getComponent(BusinessStatistics,app,BusinessStatisticsModel)} />
      <Route exact path='/business/statistics/consume/:month' component={getComponent(ConsumeSearchByDay,app,BusinessStatisticsModel)} />
      <Route exact path='/business/statistics/consume/:month/:day' component={getComponent(ConsumeSearchDayDetail,app,BusinessStatisticsModel)} />
      <Route exact path='/business/statistics/consume/:month/:day/:deviceSerial' component={getComponent(ConsumeSearchDayDevice,app,BusinessStatisticsModel)} />
      <Route exact path='/business/statistics/device/:month/:deviceSerial' component={getComponent(DeviceSearchByDay,app,BusinessStatisticsModel)} />
      <Route exact path='/business/consume-search' component={getComponent(ConsumeSearch,app,ConsumeSearchModel)} />

      <Route exact path='/business/account/edit/:id' component={getComponent(accountEdit,　app)} />
      <Route exact path='/business/account/add' component={getComponent(accountEdit,　app)} />
      <Route exact path='/business/account' component={getComponent(account,　app)} />
      <Route exact path='/business/bill/:id' component={getComponent(billDetailList,　app)} />
      <Route exact path='/business/bill' component={getComponent(bill,　app)} />
      <Route exact path='/business/bill/detail' component={getComponent(bill,　app)} />
      <Route exact path='/business/daily-bill/:id' component={getComponent(dailyDetailBill,　app)} />
      <Route exact path='/business/daily-bill' component={getComponent(dailyBill,　app)} />

      <Route exact path='/business/chipcard/:id' component={getComponent(chipcardDetail,　app)} />
      <Route exact path='/business/recharges-chipcard' component={getComponent(chipcardRechargeList,　app)} />
    </Switch>
  )
}
