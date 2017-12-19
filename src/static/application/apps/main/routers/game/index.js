import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { getComponent } from '../../components/bundle/'

import Game from 'bundle-loader?lazy!../../views/game/game/index.js'
import gameModel from 'bundle-loader?lazy!../../models/game/game/index.js'

import Supplier from 'bundle-loader?lazy!../../views/game/supplier/index.js'
import supplierModel from 'bundle-loader?lazy!../../models/game/supplier/index.js'
import SupplierEdit from 'bundle-loader?lazy!../../views/game/supplier/edit/index.js'

import Label from 'bundle-loader?lazy!../../views/game/label/index.js'
import labelModel from 'bundle-loader?lazy!../../models/game/label/index.js'

import Billboard from 'bundle-loader?lazy!../../views/game/billboard/index.js'
import billboardModel from 'bundle-loader?lazy!../../models/game/billboard/index.js'

import BillboardGames from 'bundle-loader?lazy!../../views/game/billboard/games/index.js'

export default function (history, app) {
    return (
      <Switch>
        <Route exact path='/game/game' component={getComponent(Game, app, gameModel)} />

        <Route exact path='/game/supplier' component={getComponent(Supplier, app, supplierModel)} />   
        <Route exact path='/game/supplier/:id' component={getComponent(SupplierEdit, app, supplierModel)} />     

        <Route exact path='/game/label' component={getComponent(Label, app, labelModel)} />
        <Route exact path='/game/billboard' component={getComponent(Billboard, app, billboardModel)} />

        <Route exact path='/game/billboard/:id/games' component={getComponent(BillboardGames, app, billboardModel)} />
        
           
      </Switch>
    )
  }
