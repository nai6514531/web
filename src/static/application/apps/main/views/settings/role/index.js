import React, { Component } from 'react'
import { render } from 'react-dom'
import { connect } from 'dva'
import { Form } from 'antd'
import Breadcrumb from '../../../components/layout/breadcrumb/'

const breadItems = [
  {
    title: '设置'
  },
  {
    title: '角色'
  }
]

class Role extends Component {
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
    menu: state.menu,
    loading: state.loading.global,
    ...props
  }
}
export default connect(mapStateToProps)(Form.create()(Role))
