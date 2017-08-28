import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'

import settlementPay from 'bundle-loader?lazy!../../views/settlement/pay'
import billsDetail from 'bundle-loader?lazy!../../views/settlement/pay/bill/daily'
import dailyBillsDetail from 'bundle-loader?lazy!../../views/settlement/pay/bill/detail'

export default function (history, app) {
  return (
    <Switch>
      <Route path='/finance/settlement/alipay' component={getComponent(settlementPay,　app)} />
      <Route path='/finance/settlement/wechat' component={getComponent(settlementPay,　app)} />
      <Route path='/finance/settlement/bills/:id' component={getComponent(billsDetail,　app)} />
      <Route path='/finance/settlement/daily-bills/:id' component={getComponent(dailyBillsDetail,　app)} />
    </Switch>
  )
}
