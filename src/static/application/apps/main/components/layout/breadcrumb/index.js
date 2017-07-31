import React, { Component } from 'react'
import { Breadcrumb } from 'antd'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import styles from './index.pcss'
class CustomBreadcrumb extends Component {
  render() {
    const items = this.props.items
    return (
      <div className={styles.wrap}>
        <Breadcrumb>
          {items.map((item,key) => {
            return item.url ?
              <Breadcrumb.Item key={key}><Link to={item.url}>{item.title}</Link></Breadcrumb.Item> :
              <Breadcrumb.Item key={key}>{item.title}</Breadcrumb.Item>
          })}
        </Breadcrumb>
      </div>
    )
  }
}
CustomBreadcrumb.propTypes = {
  items: PropTypes.array
}
export default CustomBreadcrumb
