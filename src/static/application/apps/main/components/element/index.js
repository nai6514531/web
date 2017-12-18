import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'dva'
import _ from 'underscore'

import CONFIG from './config'

@connect(
  function mapStateToProps(state, props) {
    return {
      elementList: state.common.userInfo.elementList,
      ...props
    }
  }
)
export const Element = (options) => (View) => class extends Component {
  constructor(props) {
    super(props)
  }

  isVisible(value) {
    let { elementList } = this.props
    return !_.chain(elementList).findWhere({ id: CONFIG[value] }).isEmpty().value()
  }

  render() {
    return <View {...this.props} isVisible={this.isVisible.bind(this)} />
  }
}

