import React, { Component } from 'react'
import { render } from 'react-dom'
import { Link } from 'react-router-dom'
import { connect } from 'dva'
import Breadcrumb from '../../../../components/layout/breadcrumb/'
const breadItems = [
  {
    title: '客服系统'
  },
  {
    title: '用户查询'
  },
  {
    title: '运营商'
  }
]

class Operator extends Component {
  componentDidMount() {
    console.log('ok')
  }
  render() {
    return(
      <div>
        <Breadcrumb items={breadItems} />
      </div>
    )
  }
}
function mapStateToProps(state,props) {
  return {
    crmOperator: state.crmOperator,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Operator)
