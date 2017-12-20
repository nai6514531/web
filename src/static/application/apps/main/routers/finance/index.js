import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle'

import settlementPay from 'bundle-loader?lazy!../../views/finance/settlement/bill'
import settlementReport from 'bundle-loader?lazy!../../views/finance/settlement/report'
import billsDetail from 'bundle-loader?lazy!../../views/finance/settlement/bill/daily'
import dailyBillsDetail from 'bundle-loader?lazy!../../views/finance/settlement/bill/detail'

export default function (app) {
  return (
    <Switch>
      <Route exact path='/finance/settlement/report' component={getComponent(settlementReport,　app)} />
      <Route exact path='/finance/settlement/alipay' component={getComponent(settlementPay,　app)} />
      <Route exact path='/finance/settlement/wechat' component={getComponent(settlementPay,　app)} />
      <Route exact path='/finance/settlement/bills/:id' component={getComponent(billsDetail,　app)} />
      <Route exact path='/finance/settlement/daily-bills/:id' component={getComponent(dailyBillsDetail,　app)} />
    </Switch>
  )
}
